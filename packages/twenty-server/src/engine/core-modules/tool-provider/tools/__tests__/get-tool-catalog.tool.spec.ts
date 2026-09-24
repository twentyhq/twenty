import { ToolCategory } from 'twenty-shared/ai';

import { MCP_EXCLUDED_TOOL_NAMES } from 'src/engine/api/mcp/constants/mcp-excluded-tool-names.const';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  createGetToolCatalogTool,
  type GetToolCatalogInput,
} from 'src/engine/core-modules/tool-provider/tools/get-tool-catalog.tool';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type ToolOutputSpillService } from 'src/engine/core-modules/tool/services/tool-output-spill.service';

const buildEntry = (
  name: string,
  category: ToolCategory,
  description: string,
  crud?: { objectName: string; operation: string },
): ToolIndexEntry => ({
  name,
  label: name,
  description,
  category,
  executionRef: { kind: 'static', toolId: name },
  ...crud,
});

const ENTRIES: ToolIndexEntry[] = [
  buildEntry('send_email', ToolCategory.ACTION, 'Send an email.'),
  buildEntry(
    'find_many_tasks',
    ToolCategory.DATABASE_CRUD,
    'Search for Tasks records.',
    { objectName: 'task', operation: 'find_many' },
  ),
  buildEntry(
    'create_one_task',
    ToolCategory.DATABASE_CRUD,
    'Create a new Task record.',
    { objectName: 'task', operation: 'create_one' },
  ),
  buildEntry(
    'create_many_tasks',
    ToolCategory.DATABASE_CRUD,
    'Create multiple Tasks records.',
    { objectName: 'task', operation: 'create_many' },
  ),
  buildEntry(
    'list_workflow_runs',
    ToolCategory.WORKFLOW,
    'List the runs of a workflow.',
  ),
];

const OPTIONS = {
  rolePermissionConfig: { unionOf: ['role-id'] },
  excludeTools: new Set(['code_interpreter']),
};

const buildCatalogTool = (entries: ToolIndexEntry[] = ENTRIES) => {
  const buildToolIndex = jest.fn().mockResolvedValue(entries);
  const toolRegistry = { buildToolIndex } as unknown as ToolRegistryService;

  return {
    buildToolIndex,
    catalogTool: createGetToolCatalogTool(
      toolRegistry,
      'workspace-id',
      'role-id',
      OPTIONS,
    ),
  };
};

describe('createGetToolCatalogTool', () => {
  it('returns every tool grouped by category when called without arguments', async () => {
    const { buildToolIndex, catalogTool } = buildCatalogTool();

    const result = await catalogTool.execute({});

    expect(buildToolIndex).toHaveBeenCalledWith('workspace-id', 'role-id', {
      ...OPTIONS,
      categories: undefined,
    });
    expect(result).toEqual({
      catalog: {
        [ToolCategory.ACTION]: [
          { name: 'send_email', description: 'Send an email.' },
        ],
        [ToolCategory.DATABASE_CRUD]: [
          { name: 'find_many_tasks', description: 'Search for Tasks records.' },
          { name: 'create_one_task', description: 'Create a new Task record.' },
          {
            name: 'create_many_tasks',
            description: 'Create multiple Tasks records.',
          },
        ],
        [ToolCategory.WORKFLOW]: [
          {
            name: 'list_workflow_runs',
            description: 'List the runs of a workflow.',
          },
        ],
      },
      message: expect.stringMatching(
        /^Found 5 tool\(s\) across 3 category\(ies\)\./,
      ),
    });
  });

  it('ignores limit when no query is given', async () => {
    const { catalogTool } = buildCatalogTool();

    const result = await catalogTool.execute({ limit: 1 });

    expect(result).toHaveProperty('catalog');
    expect(result).not.toHaveProperty('matches');
  });

  it('returns a flat ranked list capped at the default limit when a query is given', async () => {
    const manyTaskEntries = Array.from({ length: 8 }, (_, index) =>
      buildEntry(
        `find_task_view_${index}`,
        ToolCategory.VIEW,
        'Find a task view.',
      ),
    );
    const { catalogTool } = buildCatalogTool([...ENTRIES, ...manyTaskEntries]);

    const result = await catalogTool.execute({ query: 'create task' });

    expect(result).not.toHaveProperty('catalog');
    expect(result).toMatchObject({
      matches: [
        {
          name: 'create_one_task',
          category: ToolCategory.DATABASE_CRUD,
          description: 'Create a new Task record.',
        },
        { name: 'create_many_tasks' },
        expect.anything(),
        expect.anything(),
        expect.anything(),
      ],
      truncated: true,
    });
    expect(
      'totalMatches' in result ? result.totalMatches : undefined,
    ).toBeGreaterThan(5);
  });

  it('honors an explicit limit and reports when nothing was cut', async () => {
    const { catalogTool } = buildCatalogTool();

    const result = await catalogTool.execute({
      query: 'workflow runs',
      limit: 25,
    });

    expect(result).toEqual({
      matches: [
        {
          name: 'list_workflow_runs',
          category: ToolCategory.WORKFLOW,
          description: 'List the runs of a workflow.',
        },
      ],
      totalMatches: 1,
      truncated: false,
      message: expect.stringContaining('Showing 1 of 1 match(es)'),
    });
  });

  it('points to rephrasing and the valid categories when a query matches nothing', async () => {
    const { catalogTool } = buildCatalogTool();

    const result = await catalogTool.execute({ query: 'invoice' });

    expect(result).toMatchObject({
      matches: [],
      totalMatches: 0,
      truncated: false,
    });
    expect(result.message).toContain('No tools matched "invoice"');
    expect(result.message).toContain(ToolCategory.LOGIC_FUNCTION);
  });

  it('passes categories through to the tool index', async () => {
    const { buildToolIndex, catalogTool } = buildCatalogTool();

    await catalogTool.execute({ categories: [ToolCategory.LOGIC_FUNCTION] });

    expect(buildToolIndex).toHaveBeenCalledWith('workspace-id', 'role-id', {
      ...OPTIONS,
      categories: [ToolCategory.LOGIC_FUNCTION],
    });
  });

  it('rejects unknown categories instead of returning an empty catalog', async () => {
    const { buildToolIndex, catalogTool } = buildCatalogTool();

    const result = await catalogTool.execute({
      categories: ['CRUD'],
    } as unknown as GetToolCatalogInput);

    expect(buildToolIndex).not.toHaveBeenCalled();
    expect(result).toMatchObject({ success: false });
    expect('error' in result ? result.error : '').toContain(
      `Valid categories: ${Object.values(ToolCategory).join(', ')}`,
    );
  });

  it('rejects a limit outside 1-25', async () => {
    const { buildToolIndex, catalogTool } = buildCatalogTool();

    const result = await catalogTool.execute({ query: 'task', limit: 26 });

    expect(buildToolIndex).not.toHaveBeenCalled();
    expect(result).toMatchObject({ success: false });
  });

  it('reports an empty or whitespace-only query without building the index', async () => {
    for (const query of ['', '   ']) {
      const { buildToolIndex, catalogTool } = buildCatalogTool();

      const result = await catalogTool.execute({ query });

      expect(buildToolIndex).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        matches: [],
        totalMatches: 0,
        truncated: false,
      });
      expect(result.message).toContain('query is empty');
    }
  });

  it('answers a stopwords-only query with the no-match guidance', async () => {
    const { catalogTool } = buildCatalogTool();

    const result = await catalogTool.execute({ query: 'the of all' });

    expect(result).toMatchObject({ matches: [], totalMatches: 0 });
    expect(result.message).toContain('No tools matched "the of all"');
  });

  it('rejects a query longer than 200 characters', async () => {
    const { buildToolIndex, catalogTool } = buildCatalogTool();

    const result = await catalogTool.execute({ query: 'a'.repeat(201) });

    expect(buildToolIndex).not.toHaveBeenCalled();
    expect(result).toMatchObject({ success: false });
  });

  it.each([0, -1, 1.5, 26])('rejects limit %p', async (limit) => {
    const { buildToolIndex, catalogTool } = buildCatalogTool();

    const result = await catalogTool.execute({ query: 'task', limit });

    expect(buildToolIndex).not.toHaveBeenCalled();
    expect(result).toMatchObject({ success: false });
  });

  it('deduplicates categories before building the index', async () => {
    const { buildToolIndex, catalogTool } = buildCatalogTool();

    await catalogTool.execute({
      categories: [
        ToolCategory.WORKFLOW,
        ToolCategory.WORKFLOW,
        ToolCategory.ACTION,
      ],
    });

    expect(buildToolIndex).toHaveBeenCalledWith('workspace-id', 'role-id', {
      ...OPTIONS,
      categories: [ToolCategory.WORKFLOW, ToolCategory.ACTION],
    });
  });

  describe('through the real tool registry', () => {
    const EXCLUDED_TOOL_DESCRIPTIONS: Record<string, string> = {
      code_interpreter: 'Run Python code in a sandbox.',
      http_request: 'Make an HTTP request to an external API.',
      extract_json_paths: 'Extract JSON paths from a spilled output file.',
      search_output: 'Search a spilled output file.',
    };

    const buildProvider = (
      category: ToolCategory,
      entries: ToolIndexEntry[],
    ): ToolProvider => ({
      category,
      isAvailable: async () => true,
      generateDescriptors: async () => entries,
      executeStaticTool: async () => ({ success: true, message: '' }),
    });

    const PROVIDER_ENTRIES: ToolIndexEntry[][] = [
      [
        ...[...MCP_EXCLUDED_TOOL_NAMES].map((name) =>
          buildEntry(
            name,
            ToolCategory.ACTION,
            EXCLUDED_TOOL_DESCRIPTIONS[name] ?? `Run ${name}.`,
          ),
        ),
        buildEntry('send_email', ToolCategory.ACTION, 'Send an email.'),
      ],
      ENTRIES.filter((entry) => entry.category === ToolCategory.DATABASE_CRUD),
      ENTRIES.filter((entry) => entry.category === ToolCategory.WORKFLOW),
    ];

    const buildRegistryCatalogTool = (excludeTools?: Set<string>) =>
      createGetToolCatalogTool(
        new ToolRegistryService(
          PROVIDER_ENTRIES.map((entries) =>
            buildProvider(entries[0].category, entries),
          ),
          {} as ToolExecutorService,
          {} as ToolOutputSpillService,
        ),
        'workspace-id',
        'role-id',
        { ...OPTIONS, excludeTools },
      );

    // The grouping get_tool_catalog used before query search existed, kept
    // here as the oracle for the unchanged no-query path.
    const buildPreChangeCatalog = (
      entries: ToolIndexEntry[],
      excludeTools: Set<string>,
      categories?: string[],
    ) => {
      const categoryFilter = categories ? new Set(categories) : undefined;
      const catalog: Record<
        string,
        Array<{ name: string; description: string }>
      > = {};

      for (const entry of entries) {
        if (excludeTools.has(entry.name)) {
          continue;
        }

        if (categoryFilter && !categoryFilter.has(entry.category)) {
          continue;
        }

        if (!catalog[entry.category]) {
          catalog[entry.category] = [];
        }

        catalog[entry.category].push({
          name: entry.name,
          description: entry.description,
        });
      }

      return catalog;
    };

    const getCatalog = (result: object) =>
      'catalog' in result
        ? (result.catalog as Record<string, Array<{ name: string }>>)
        : {};

    const getMatchNames = (result: object) =>
      'matches' in result
        ? (result.matches as Array<{ name: string }>).map((match) => match.name)
        : [];

    it('keeps every MCP-excluded tool out of the no-argument catalog', async () => {
      const unfiltered = await buildRegistryCatalogTool().execute({});
      const filtered = await buildRegistryCatalogTool(
        MCP_EXCLUDED_TOOL_NAMES,
      ).execute({});

      const unfilteredNames = Object.values(getCatalog(unfiltered))
        .flat()
        .map((tool) => tool.name);
      const filteredNames = Object.values(getCatalog(filtered))
        .flat()
        .map((tool) => tool.name);

      expect(unfilteredNames).toEqual(
        expect.arrayContaining([...MCP_EXCLUDED_TOOL_NAMES]),
      );
      for (const excludedName of MCP_EXCLUDED_TOOL_NAMES) {
        expect(filteredNames).not.toContain(excludedName);
      }
      expect(filteredNames).toContain('send_email');
    });

    it('keeps every MCP-excluded tool out of query results that would match it', async () => {
      for (const excludedName of MCP_EXCLUDED_TOOL_NAMES) {
        const query = excludedName.replace(/_/g, ' ');

        const unfiltered = await buildRegistryCatalogTool().execute({
          query,
          limit: 25,
        });
        const filtered = await buildRegistryCatalogTool(
          MCP_EXCLUDED_TOOL_NAMES,
        ).execute({ query, limit: 25 });

        expect(getMatchNames(unfiltered)[0]).toBe(excludedName);
        for (const name of MCP_EXCLUDED_TOOL_NAMES) {
          expect(getMatchNames(filtered)).not.toContain(name);
        }
      }
    });

    it('returns exactly the pre-change catalog when called without a query', async () => {
      const allEntries = PROVIDER_ENTRIES.flat();

      for (const categories of [
        undefined,
        [ToolCategory.WORKFLOW, ToolCategory.DATABASE_CRUD],
        [],
      ]) {
        const result = await buildRegistryCatalogTool(
          MCP_EXCLUDED_TOOL_NAMES,
        ).execute({ categories });

        const expectedCatalog = buildPreChangeCatalog(
          allEntries,
          MCP_EXCLUDED_TOOL_NAMES,
          categories,
        );

        expect(getCatalog(result)).toStrictEqual(expectedCatalog);
        expect(Object.keys(getCatalog(result))).toEqual(
          Object.keys(expectedCatalog),
        );
      }
    });
  });
});
