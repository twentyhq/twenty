import { z } from 'zod';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';

export const LEARN_TOOLS_TOOL_NAME = 'learn_tools';

const learnToolsAspectSchema = z.enum(['description', 'schema']);

export type LearnToolsAspect = z.infer<typeof learnToolsAspectSchema>;

export const learnToolsInputSchema = z.object({
  toolNames: z
    .array(z.string())
    .describe('Exact tool names. Do not guess tool names.'),
  aspects: z
    .array(learnToolsAspectSchema)
    .optional()
    .default(['description', 'schema'])
    .describe('What to learn: description, schema, or both.'),
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
  forbidden: string[];
  message: string;
};

export const createLearnToolsTool = (
  toolRegistry: ToolRegistryService,
  context: ToolContext,
  excludeTools?: Set<string>,
) => ({
  description:
    'Get input schemas for tools. Call this with exact tool names to learn the required arguments before calling execute_tool.',
  inputSchema: learnToolsInputSchema,
  execute: async (parameters: LearnToolsInput): Promise<LearnToolsResult> => {
    const { toolNames, aspects } = parameters;

    const excludedInContext = excludeTools
      ? toolNames.filter((name) => excludeTools.has(name))
      : [];
    const allowedNames = excludeTools
      ? toolNames.filter((name) => !excludeTools.has(name))
      : toolNames;

    const toolInfos = await toolRegistry.getToolInfo(
      allowedNames,
      context,
      aspects,
    );

    const foundNames = new Set(toolInfos.map((t) => t.name));
    const missingNames = allowedNames.filter((name) => !foundNames.has(name));

    const { forbidden, notFound } =
      await toolRegistry.classifyUnavailableTools(missingNames, context);

    const messageParts = [
      toolInfos.length > 0
        ? `Learned ${toolInfos.length} tool(s): ${toolInfos.map((t) => t.name).join(', ')}.`
        : `Learned 0 tool(s).`,
    ];

    if (forbidden.length > 0) {
      messageParts.push(
        `Not permitted (exist but your role lacks access): ${forbidden.join(', ')}.`,
      );
    }

    if (excludedInContext.length > 0) {
      messageParts.push(
        `Not permitted through this interface: ${excludedInContext.join(', ')}.`,
      );
    }

    if (notFound.length > 0) {
      messageParts.push(`Could not find: ${notFound.join(', ')}.`);
    }

    return {
      tools: toolInfos,
      notFound: [...notFound, ...excludedInContext],
      forbidden,
      message: messageParts.join(' '),
    };
  },
});
