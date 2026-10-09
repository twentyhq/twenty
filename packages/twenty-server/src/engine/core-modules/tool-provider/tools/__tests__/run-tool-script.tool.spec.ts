import { execFileSync } from 'node:child_process';

import { isArray, isObject } from '@sniptt/guards';

import { MontyPoolService } from 'src/engine/core-modules/code-mode/services/monty-pool.service';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  createRunToolScriptTool,
  type RunToolScriptOutput,
} from 'src/engine/core-modules/tool-provider/tools/run-tool-script.tool';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

// Jest's module system cannot load this ESM-only native package, and its module shim patches
// createRequire, so take Node's own require from getBuiltinModule
jest.mock(
  'src/engine/core-modules/code-mode/utils/load-monty-module.util',
  () => ({
    loadMontyModule: async () =>
      process.getBuiltinModule('node:module').createRequire(__filename)(
        '@pydantic/monty',
      ),
  }),
);

jest.mock(
  'src/engine/core-modules/tool-provider/constants/run-tool-script-limits.constant',
  () => ({
    RUN_TOOL_SCRIPT_LIMITS: {
      ...jest.requireActual(
        'src/engine/core-modules/tool-provider/constants/run-tool-script-limits.constant',
      ).RUN_TOOL_SCRIPT_LIMITS,
      maxFeedDurationSeconds: 2,
    },
  }),
);

const FAKE_SECRET = 'sk-run-tool-script-fake-secret-4242';

const OPPORTUNITIES = [
  { id: 'opportunity-1', name: 'Acme', amount: 100 },
  { id: 'opportunity-2', name: 'Globex', amount: 250 },
  { id: 'opportunity-3', name: 'Initech', amount: 50 },
];

const TOOL_HANDLERS: Record<
  string,
  (toolArguments: Record<string, unknown>) => ToolOutput
> = {
  find_many_opportunities: () => ({
    success: true,
    message: 'Found 3 opportunities',
    result: { records: OPPORTUNITIES },
  }),
  find_many_task_targets: () => ({
    success: true,
    message: 'Found 1 task target',
    result: { records: [{ id: 'target-1', opportunityId: 'opportunity-2' }] },
  }),
  echo: (toolArguments) => ({
    success: true,
    message: 'Echoed',
    result: toolArguments,
  }),
  failing_tool: () => ({
    success: false,
    message: 'Failed',
    error: 'Field "nope" does not exist',
  }),
};

const CATALOG: Record<string, Partial<ToolIndexEntry>> = {
  create_one_task: {
    name: 'create_one_task',
    approval: { template: 'recordCreate' },
  },
};

// Monty only converts objects whose prototype is its own realm's Object.prototype, or null, and
// jest runs specs in a separate realm
const toSandboxValue = (value: unknown): unknown => {
  if (isArray(value)) {
    return value.map(toSandboxValue);
  }

  if (isObject(value)) {
    return Object.assign(
      Object.create(null),
      Object.fromEntries(
        Object.entries(value).map(([key, entryValue]) => [
          key,
          toSandboxValue(entryValue),
        ]),
      ),
    );
  }

  return value;
};

const buildToolRegistry = () =>
  ({
    resolveAndExecute: jest.fn(
      async (toolName: string, toolArguments: Record<string, unknown>) => {
        const output = TOOL_HANDLERS[toolName]?.(toolArguments) ?? {
          success: false,
          message: `Tool "${toolName}" not found`,
          error: `Tool "${toolName}" not found.`,
        };

        return { ...output, result: toSandboxValue(output.result) };
      },
    ),
    findCatalogEntry: jest.fn(async (toolName: string) => CATALOG[toolName]),
  }) as unknown as ToolRegistryService & {
    resolveAndExecute: jest.Mock;
    findCatalogEntry: jest.Mock;
  };

describe('createRunToolScriptTool', () => {
  const context = {
    workspaceId: 'workspace-id',
    roleId: 'role-id',
  } as ToolContext;
  let montyPoolService: MontyPoolService;
  let toolRegistry: ReturnType<typeof buildToolRegistry>;

  const runScript = (
    code: string,
    isToolAllowed?: (toolName: string) => boolean,
  ): Promise<RunToolScriptOutput> =>
    createRunToolScriptTool(toolRegistry, montyPoolService, context, {
      isToolAllowed,
    }).execute({ code });

  beforeAll(() => {
    jest.useRealTimers();
    montyPoolService = new MontyPoolService();
  });

  beforeEach(() => {
    toolRegistry = buildToolRegistry();
  });

  afterAll(async () => {
    await montyPoolService.onModuleDestroy();
  });

  it('chains tool calls, aggregates in Python and returns a dict', async () => {
    const output = await runScript(`
import asyncio

opportunities, targets = await asyncio.gather(
    call_tool("find_many_opportunities", {"filter": {"closeDate": {"gte": "2026-10-01"}}}),
    call_tool("find_many_task_targets", {"filter": {"opportunityId": {"in": ["opportunity-1", "opportunity-2"]}}}),
)
covered = {target["opportunityId"] for target in targets["records"]}
print("covered", len(covered))
{
    "uncovered": sorted([o["id"] for o in opportunities["records"] if o["id"] not in covered]),
    "total": sum(o["amount"] for o in opportunities["records"]),
}
`);

    expect(output).toEqual({
      success: true,
      message: 'The script ran 2 tool call(s)',
      result: { uncovered: ['opportunity-1', 'opportunity-3'], total: 400 },
      stdout: 'covered 1\n',
      stderr: '',
      toolCalls: [
        { name: 'find_many_opportunities', success: true },
        { name: 'find_many_task_targets', success: true },
      ],
    });
    expect(toolRegistry.resolveAndExecute).toHaveBeenCalledWith(
      'find_many_opportunities',
      { filter: { closeDate: { gte: '2026-10-01' } } },
      context,
      { compactOutput: true },
    );
  });

  it('accepts keyword arguments and converts values JSON cannot hold', async () => {
    const output = await runScript(`
import datetime

echoed = await call_tool(name="echo", args={"day": datetime.date(2026, 10, 9), "ids": (1, 2)})
{"echoed": echoed, "tags": {"a"}, "big": 2 ** 70, "keys": {1: "one"}}
`);

    expect(output.success).toBe(true);
    expect(output.result).toEqual({
      echoed: { day: '2026-10-09', ids: [1, 2] },
      tags: ['a'],
      big: '1180591620717411303424',
      keys: { '1': 'one' },
    });
  });

  describe('when a tool fails', () => {
    it('raises an exception the script can catch', async () => {
      const output = await runScript(`
try:
    await call_tool("failing_tool", {})
    outcome = "no error"
except Exception as error:
    outcome = str(error)
outcome
`);

      expect(output.success).toBe(true);
      expect(output.result).toContain('Field "nope" does not exist');
      expect(output.toolCalls).toEqual([
        { name: 'failing_tool', success: false },
      ]);
    });

    it('fails the script with the tool error when not caught', async () => {
      const output = await runScript('await call_tool("failing_tool", {})');

      expect(output.success).toBe(false);
      expect(output.error).toContain('Field "nope" does not exist');
    });
  });

  describe('refusals', () => {
    it.each([
      ['an excluded tool', 'http_request'],
      ['a tool that supports approval', 'create_one_task'],
      ['run_tool_script itself', 'run_tool_script'],
      ['execute_tool', 'execute_tool'],
      ['code_interpreter', 'code_interpreter'],
    ])('refuses %s without executing it', async (_title, toolName) => {
      const output = await runScript(
        `await call_tool("${toolName}", {})`,
        (candidateToolName) => candidateToolName !== 'http_request',
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain(`Tool "${toolName}"`);
      expect(output.toolCalls).toEqual([{ name: toolName, success: false }]);
      expect(toolRegistry.resolveAndExecute).not.toHaveBeenCalled();
    });
  });

  it('raises once a script exceeds the tool call cap', async () => {
    const output = await runScript(`
count = 0
for index in range(101):
    await call_tool("echo", {"index": index})
    count += 1
count
`);

    expect(output.success).toBe(false);
    expect(output.error).toContain('at most 100 tool calls');
    expect(toolRegistry.resolveAndExecute).toHaveBeenCalledTimes(100);
  });

  describe('sandbox', () => {
    beforeAll(() => {
      process.env.TWENTY_RUN_TOOL_SCRIPT_FAKE_SECRET = FAKE_SECRET;
    });

    afterAll(() => {
      delete process.env.TWENTY_RUN_TOOL_SCRIPT_FAKE_SECRET;
    });

    it.each([
      ['open', "open('/etc/passwd').read()", 'unresolved-reference'],
      ['os.environ', 'import os\nos.environ', "'os.environ' is not supported"],
      [
        'os.getenv',
        "import os\nos.getenv('TWENTY_RUN_TOOL_SCRIPT_FAKE_SECRET')",
        "'os.getenv' is not supported",
      ],
      ['socket', 'import socket', 'unresolved-import'],
      ['subprocess', 'import subprocess', 'unresolved-import'],
      ['__import__', "__import__('os')", 'unresolved-reference'],
      [
        '/proc/self/environ',
        "from pathlib import Path\nPath('/proc/self/environ').read_text()",
        'PermissionError',
      ],
    ])('blocks %s', async (_title, code, expectedError) => {
      const output = await runScript(code);

      expect(output.success).toBe(false);
      expect(output.error).toContain(expectedError);
      expect(JSON.stringify(output)).not.toContain(FAKE_SECRET);
    });

    it('blocks a file read at runtime too, past the type checker', async () => {
      const output = await runScript(
        "opener = eval('open')\nopener('/etc/passwd').read()",
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('PermissionError');
    });
  });

  describe('limits', () => {
    it('stops an endless loop at the duration limit and keeps serving', async () => {
      const output = await runScript('while True:\n    pass');

      expect(output.success).toBe(false);
      expect(output.error).toContain('TimeoutError');

      const nextOutput = await runScript('1 + 1');

      expect(nextOutput.result).toBe(2);
    }, 15_000);

    it('stops a huge allocation at the memory limit and keeps serving', async () => {
      const output = await runScript("x = 'a' * 10**9\nlen(x)");

      expect(output.success).toBe(false);
      expect(output.error).toContain('MemoryError');

      const nextOutput = await runScript('1 + 1');

      expect(nextOutput.result).toBe(2);
    });

    it('survives a worker crash mid-script', async () => {
      toolRegistry.resolveAndExecute.mockImplementationOnce(async () => {
        execFileSync('pkill', ['-9', '-P', String(process.pid), 'monty']);
        await new Promise((resolve) => setTimeout(resolve, 200));

        return { success: true, message: 'ok', result: {} };
      });

      const output = await runScript(
        'await call_tool("echo", {})\n"unreachable"',
      );

      expect(output.success).toBe(false);
      expect(output.error).toContain('crashed');

      const nextOutput = await runScript('1 + 1');

      expect(nextOutput.result).toBe(2);
    }, 15_000);

    it('truncates long stdout', async () => {
      const output = await runScript(
        "for _ in range(5000):\n    print('x' * 20)",
      );

      expect(output.success).toBe(true);
      expect(output.stdout.length).toBeLessThan(33 * 1024);
      expect(output.stdout).toContain('[output truncated]');
    });
  });

  describe('bad scripts', () => {
    it('reports a syntax error', async () => {
      const output = await runScript('def (:');

      expect(output.success).toBe(false);
      expect(output.error).toContain('invalid-syntax');
    });

    it('reports a type error before running', async () => {
      const output = await runScript('await call_tool(1, 2)');

      expect(output.success).toBe(false);
      expect(output.error).toContain('Type check failed');
      expect(toolRegistry.resolveAndExecute).not.toHaveBeenCalled();
    });
  });
});
