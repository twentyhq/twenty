import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const LEARN_TOOLS_TOOL_NAME = 'learn_tools';

const learnToolsAspectSchema = z.enum(['description', 'schema']);

export type LearnToolsAspect = z.infer<typeof learnToolsAspectSchema>;

export const learnToolsInputSchema = z.object({
  toolNames: z
    .array(z.string())
    .describe(
      'Tool names to learn. A name you built from the CRUD grammar is fine: unknown names come back under notFound with the closest matching names. Pass every tool you need to learn in this single array — do not make separate learn_tools calls per tool.',
    ),
  aspects: z
    .array(learnToolsAspectSchema)
    .optional()
    .default(['description', 'schema'])
    .describe(
      'What to learn: ["description"], ["schema"], or ["description", "schema"].',
    ),
});

export type LearnToolsInput = z.infer<typeof learnToolsInputSchema>;

export type LearnToolsResultEntry = {
  name: string;
  description?: string;
  inputSchema?: object;
};

export type LearnToolsResult = {
  tools: LearnToolsResultEntry[];
  notFound: string[];
  suggestions?: Record<string, string[]>;
  message: string;
  spilledTools?: object;
  warnings?: string[];
};

export type LearnToolsOptions = {
  isToolAllowed?: (toolName: string) => boolean;
  spillLargeOutput?: boolean;
  discoveryHint?: string;
};

export const createLearnToolsTool = (
  toolRegistry: ToolRegistryService,
  context: ToolContext,
  options?: LearnToolsOptions,
) => ({
  description:
    'Get input schemas for tools, and confirm a tool name exists. Pass all the tool names you need in a single call (toolNames accepts an array) rather than calling learn_tools once per tool. A name you built from the CRUD grammar is safe to pass: unknown names come back under notFound with the closest matching names, so you never need a catalog call just to check a name.',
  inputSchema: learnToolsInputSchema,
  execute: async (parameters: LearnToolsInput): Promise<LearnToolsResult> => {
    const { toolNames, aspects } = parameters;

    const { isToolAllowed, discoveryHint } = options ?? {};

    const allowedNames: string[] = [];
    const unavailableNames: string[] = [];

    for (const toolName of toolNames) {
      if (isToolAllowed?.(toolName) === false) {
        unavailableNames.push(toolName);
      } else {
        allowedNames.push(toolName);
      }
    }

    const toolInfos = await toolRegistry.getToolInfo(
      allowedNames,
      context,
      aspects,
    );

    const foundNames = new Set(toolInfos.map((toolInfo) => toolInfo.name));
    const unknownNames = allowedNames.filter((name) => !foundNames.has(name));
    const notFound = [...unknownNames, ...unavailableNames];

    const suggestions: Record<string, string[]> =
      unknownNames.length > 0
        ? await toolRegistry.suggestSimilarToolNames(unknownNames, context)
        : {};

    const messageParts: string[] = [];

    if (toolInfos.length > 0) {
      const learnedNames = toolInfos.map((toolInfo) => toolInfo.name);
      const toolNoun = learnedNames.length === 1 ? 'tool' : 'tools';

      messageParts.push(
        `Learned ${learnedNames.length} ${toolNoun}: ${learnedNames.join(', ')}`,
      );
    }

    if (notFound.length > 0) {
      const notFoundDescription = [
        ...unknownNames.map((name) => {
          const similarToolNames = suggestions[name];

          return similarToolNames?.length
            ? `${name} (did you mean: ${similarToolNames.join(', ')}?)`
            : name;
        }),
        ...unavailableNames.map(
          (name) => `${name} (not available in this context)`,
        ),
      ].join('; ');

      messageParts.push(`Could not find: ${notFoundDescription}`);
    }

    const discoveryHintSuffix =
      unknownNames.length > 0 && isDefined(discoveryHint)
        ? ` ${discoveryHint}`
        : '';

    const learnToolsResult: LearnToolsResult = {
      tools: toolInfos,
      notFound,
      ...(Object.keys(suggestions).length > 0 && { suggestions }),
      message:
        messageParts.length > 0
          ? `${messageParts.join('. ')}.${discoveryHintSuffix}`
          : 'No matching tools found.',
    };

    if (options?.spillLargeOutput !== true) {
      return learnToolsResult;
    }

    const spillCandidate: ToolOutput = {
      success: true,
      message: learnToolsResult.message,
      result: { tools: learnToolsResult.tools },
    };

    const spillOutcome = await toolRegistry.spillToolOutputIfTooLarge(
      spillCandidate,
      context,
      LEARN_TOOLS_TOOL_NAME,
    );

    if (spillOutcome === spillCandidate) {
      return learnToolsResult;
    }

    return {
      ...learnToolsResult,
      tools: [],
      ...(isDefined(spillOutcome.result) && {
        spilledTools: spillOutcome.result,
      }),
      ...(isDefined(spillOutcome.warnings) && {
        warnings: spillOutcome.warnings,
      }),
    };
  },
});
