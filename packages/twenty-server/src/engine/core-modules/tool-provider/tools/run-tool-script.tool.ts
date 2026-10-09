import { isNonEmptyString, isObject } from '@sniptt/guards';
import { jsonSchema } from 'ai';
import { type JSONSchema7 } from 'json-schema';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { z } from 'zod';

import { type MontyPoolService } from 'src/engine/core-modules/code-mode/services/monty-pool.service';
import { convertMontyValueToJson } from 'src/engine/core-modules/code-mode/utils/convert-monty-value-to-json.util';
import { createScriptOutputCollector } from 'src/engine/core-modules/code-mode/utils/create-script-output-collector.util';
import { RUN_TOOL_SCRIPT_LIMITS } from 'src/engine/core-modules/tool-provider/constants/run-tool-script-limits.constant';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { EXECUTE_TOOL_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools/execute-tool.tool';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export const RUN_TOOL_SCRIPT_TOOL_NAME = 'run_tool_script';

const TOOL_NAMES_FORBIDDEN_IN_SCRIPTS = new Set([
  RUN_TOOL_SCRIPT_TOOL_NAME,
  EXECUTE_TOOL_TOOL_NAME,
  'code_interpreter',
]);

const CALL_TOOL_TYPE_STUBS = `from typing import Any

async def call_tool(name: str, args: dict) -> Any: ...
`;

const RUN_TOOL_SCRIPT_DESCRIPTION = `Run a short Python script that chains several tool calls in one step: loops over records, aggregations, and multi-step chains where one call's output feeds the next. Call learn_tools first to get the exact schema of every tool the script calls.

In the script:
- \`await call_tool(name, args)\` runs a tool and returns its result. call_tool is async, so always await it; \`asyncio.gather\` runs independent calls together.
- A failed tool call raises an exception carrying the tool's error. Catch it with try/except to carry on.
- The value of the final expression is the script's result. Return a small summary (ids, counts), not whole records. print() output comes back as stdout.
- Available modules: json, datetime, re, math, collections, itertools, functools, asyncio, typing, dataclasses, random, time, base64, copy. No other imports, no third-party packages, no file, network or environment access.
- Not supported: class inheritance, generators (yield), match statements.
- Keep scripts flat: top-level code with plain dicts and lists. At most ${RUN_TOOL_SCRIPT_LIMITS.maxToolCalls} tool calls per script.
- Tools that support user approval (create_one_*, update_one_*, delete_one_*, send_email, draft_email) cannot be called from a script: use the matching *_many_* tool, or call them with ${EXECUTE_TOOL_TOOL_NAME}.`;

const runToolScriptInputZodSchema = z.object({
  code: z
    .string()
    .describe('Python script. Its final expression is returned as the result.'),
});

export type RunToolScriptInput = z.infer<typeof runToolScriptInputZodSchema>;

export const runToolScriptInputSchema = jsonSchema<RunToolScriptInput>(
  () => {
    const schema = z.toJSONSchema(runToolScriptInputZodSchema, {
      target: 'draft-7',
      io: 'input',
    }) as JSONSchema7;

    schema.additionalProperties = false;

    return schema;
  },
  {
    validate: async (value) => {
      const result = await z.safeParseAsync(runToolScriptInputZodSchema, value);

      return result.success
        ? { success: true, value: result.data }
        : { success: false, error: result.error };
    },
  },
);

export type RunToolScriptOutput = {
  success: boolean;
  message: string;
  result?: unknown;
  stdout: string;
  stderr: string;
  toolCalls: { name: string; success: boolean }[];
  error?: string;
};

// Python keyword arguments reach the host as one trailing null-prototype object; dicts arrive as Maps
const isKeywordArguments = (value: unknown): value is Record<string, unknown> =>
  isObject(value) && Object.getPrototypeOf(value) === null;

const parseCallToolArguments = (callArguments: unknown[]) => {
  const lastArgument = callArguments[callArguments.length - 1];
  const hasKeywordArguments = isKeywordArguments(lastArgument);
  const keywordArguments = hasKeywordArguments ? lastArgument : {};
  const positionalArguments = hasKeywordArguments
    ? callArguments.slice(0, -1)
    : callArguments;

  const toolName = positionalArguments[0] ?? keywordArguments.name;
  const toolArguments = convertMontyValueToJson(
    positionalArguments[1] ?? keywordArguments.args ?? {},
  );

  if (!isNonEmptyString(toolName)) {
    throw new TypeError('call_tool expects the tool name as a string');
  }

  if (!isPlainObject(toolArguments)) {
    throw new TypeError('call_tool expects the tool arguments as a dict');
  }

  return { toolName, toolArguments };
};

export const createRunToolScriptTool = (
  toolRegistry: ToolRegistryService,
  montyPool: MontyPoolService,
  context: ToolContext,
  options?: {
    isToolAllowed?: (toolName: string) => boolean;
  },
) => ({
  description: RUN_TOOL_SCRIPT_DESCRIPTION,
  inputSchema: runToolScriptInputSchema,
  execute: async ({
    code,
  }: RunToolScriptInput): Promise<RunToolScriptOutput> => {
    const toolCalls: RunToolScriptOutput['toolCalls'] = [];
    const catalogEntryByToolName = new Map<
      string,
      Promise<ToolIndexEntry | undefined>
    >();
    const outputCollector = createScriptOutputCollector(
      RUN_TOOL_SCRIPT_LIMITS.maxOutputStreamLength,
    );
    let attemptedToolCallCount = 0;

    const findCatalogEntry = (toolName: string) => {
      const cachedEntry = catalogEntryByToolName.get(toolName);

      if (isDefined(cachedEntry)) {
        return cachedEntry;
      }

      const entry = toolRegistry.findCatalogEntry(toolName, context);

      catalogEntryByToolName.set(toolName, entry);

      return entry;
    };

    const refuseToolCall = (toolName: string, reason: string): never => {
      toolCalls.push({ name: toolName, success: false });

      throw new Error(`Tool "${toolName}" ${reason}`);
    };

    const callTool = async (...callArguments: unknown[]): Promise<unknown> => {
      attemptedToolCallCount++;

      if (attemptedToolCallCount > RUN_TOOL_SCRIPT_LIMITS.maxToolCalls) {
        throw new Error(
          `A script can make at most ${RUN_TOOL_SCRIPT_LIMITS.maxToolCalls} tool calls`,
        );
      }

      const { toolName, toolArguments } = parseCallToolArguments(callArguments);

      if (
        TOOL_NAMES_FORBIDDEN_IN_SCRIPTS.has(toolName) ||
        options?.isToolAllowed?.(toolName) === false
      ) {
        return refuseToolCall(
          toolName,
          'is not available in scripts and cannot be called here',
        );
      }

      const catalogEntry = await findCatalogEntry(toolName);

      if (isDefined(catalogEntry?.approval)) {
        return refuseToolCall(
          toolName,
          `supports user approval and cannot be called from a script. Use the matching *_many_* tool, or call it with ${EXECUTE_TOOL_TOOL_NAME}`,
        );
      }

      const toolOutput = await toolRegistry.resolveAndExecute(
        toolName,
        toolArguments,
        context,
        { compactOutput: true },
      );

      toolCalls.push({ name: toolName, success: toolOutput.success });

      if (!toolOutput.success) {
        throw new Error(
          `Tool "${toolName}" failed: ${toolOutput.error ?? toolOutput.message}`,
        );
      }

      return toolOutput.result ?? null;
    };

    const scriptRun = await montyPool.runScript({
      code,
      checkoutOptions: {
        limits: {
          maxMemory: RUN_TOOL_SCRIPT_LIMITS.maxMemoryBytes,
          maxFeedDurationSecs: RUN_TOOL_SCRIPT_LIMITS.maxFeedDurationSeconds,
        },
        typeCheck: true,
        typeCheckStubs: CALL_TOOL_TYPE_STUBS,
        typeCheckFormat: 'concise',
      },
      externalFunctions: { call_tool: callTool },
      onPrint: outputCollector.onPrint,
    });

    const { stdout, stderr } = outputCollector.getOutput();

    if (!scriptRun.success) {
      return {
        success: false,
        message: 'The script failed',
        error: scriptRun.error.slice(
          0,
          RUN_TOOL_SCRIPT_LIMITS.maxOutputStreamLength,
        ),
        stdout,
        stderr,
        toolCalls,
      };
    }

    return {
      success: true,
      message: `The script ran ${toolCalls.length} tool call(s)`,
      result: convertMontyValueToJson(scriptRun.value),
      stdout,
      stderr,
      toolCalls,
    };
  },
});
