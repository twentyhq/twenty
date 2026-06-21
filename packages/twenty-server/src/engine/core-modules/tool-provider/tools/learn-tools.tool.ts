import { z } from 'zod';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';

export const LEARN_TOOLS_TOOL_NAME = 'learn_tools';

const learnToolsAspectSchema = z.enum(['description', 'schema']);

export type LearnToolsAspect = z.infer<typeof learnToolsAspectSchema>;

export const learnToolsInputSchema = z.object({
  toolNames: z
    .array(z.string())
    .describe(
      'Exact tool names. Do not guess tool names. Pass every tool you need to learn in this single array — do not make separate learn_tools calls per tool.',
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
};

export const createLearnToolsTool = (
  toolRegistry: ToolRegistryService,
  context: ToolContext,
  excludeTools?: Set<string>,
) => ({
  description:
    'Get input schemas for tools. Pass all the tool names you need in a single call (toolNames accepts an array) rather than calling learn_tools once per tool. Call this with exact tool names to learn the required arguments before calling execute_tool.',
  inputSchema: learnToolsInputSchema,
  execute: async (parameters: LearnToolsInput): Promise<LearnToolsResult> => {
    const { toolNames, aspects } = parameters;

    const allowedNames = excludeTools
      ? toolNames.filter((name) => !excludeTools.has(name))
      : toolNames;

    const toolInfos = await toolRegistry.getToolInfo(
      allowedNames,
      context,
      aspects,
    );

    const foundNames = new Set(toolInfos.map((toolInfo) => toolInfo.name));
    // Base notFound on allowedNames so excluded tools aren't surfaced as
    // missing (which would also trigger misleading suggestions).
    const notFound = allowedNames.filter((name) => !foundNames.has(name));

    const suggestions: Record<string, string[]> =
      notFound.length > 0
        ? await toolRegistry.suggestSimilarToolNames(notFound, context)
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
      const notFoundDescription = notFound
        .map((name) => {
          const similarToolNames = suggestions[name];

          return similarToolNames?.length
            ? `${name} (did you mean: ${similarToolNames.join(', ')}?)`
            : name;
        })
        .join('; ');

      messageParts.push(`Could not find: ${notFoundDescription}`);
    }

    return {
      tools: toolInfos,
      notFound,
      ...(Object.keys(suggestions).length > 0 && { suggestions }),
      message:
        messageParts.length > 0
          ? `${messageParts.join('. ')}.`
          : 'No matching tools found.',
    };
  },
});
