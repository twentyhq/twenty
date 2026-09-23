import { ToolCategory } from 'twenty-shared/ai';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { createGetToolCatalogTool } from 'src/engine/core-modules/tool-provider/tools/get-tool-catalog.tool';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

const buildEntry = (
  name: string,
  category: ToolCategory,
  extra?: { objectName?: string; operation?: string },
): ToolIndexEntry =>
  ({
    name,
    label: name,
    description: `Description for ${name}`,
    category,
    ...extra,
  }) as ToolIndexEntry;

const CRUD_ENTRIES = [
  buildEntry('find_many_people', ToolCategory.DATABASE_CRUD, {
    objectName: 'person',
    operation: 'find_many',
  }),
  buildEntry('find_one_person', ToolCategory.DATABASE_CRUD, {
    objectName: 'person',
    operation: 'find_one',
  }),
  buildEntry('create_one_person', ToolCategory.DATABASE_CRUD, {
    objectName: 'person',
    operation: 'create_one',
  }),
];

const ROLE_ENTRY = buildEntry('list_roles', ToolCategory.ROLE);

const buildToolRegistry = (entries: ToolIndexEntry[]) => {
  const buildToolIndex = jest.fn().mockResolvedValue(entries);

  return {
    toolRegistry: { buildToolIndex } as unknown as ToolRegistryService,
    buildToolIndex,
  };
};

describe('createGetToolCatalogTool', () => {
  it('collapses database tools instead of listing one entry per tool', async () => {
    const { toolRegistry } = buildToolRegistry([...CRUD_ENTRIES, ROLE_ENTRY]);

    const result = await createGetToolCatalogTool(
      toolRegistry,
      'workspace-id',
      'role-id',
    ).execute({});

    expect(result.catalog[ToolCategory.DATABASE_CRUD]).toBeUndefined();
    expect(result.catalog[ToolCategory.ROLE]).toEqual([
      { name: 'list_roles', description: 'Description for list_roles' },
    ]);
    expect(result.databaseCrudTools?.objectGroups).toEqual([
      {
        operations: ['find_many', 'find_one', 'create_one'],
        objects: [{ plural: 'people', singular: 'person' }],
      },
    ]);
    expect(result.message).toContain('Found 4 tool(s) across 2 category(ies)');
  });

  it('omits databaseCrudTools when no record tool is reachable', async () => {
    const { toolRegistry } = buildToolRegistry([ROLE_ENTRY]);

    const result = await createGetToolCatalogTool(
      toolRegistry,
      'workspace-id',
      'role-id',
    ).execute({});

    expect(result.databaseCrudTools).toBeUndefined();
    expect(result.message).toBe('Found 1 tool(s) across 1 category(ies).');
  });

  it('pushes a known category down to the registry so skipped providers never run', async () => {
    const { toolRegistry, buildToolIndex } = buildToolRegistry([ROLE_ENTRY]);

    await createGetToolCatalogTool(toolRegistry, 'workspace-id', 'role-id', {
      userId: 'user-id',
    }).execute({ categories: [ToolCategory.ROLE] });

    expect(buildToolIndex).toHaveBeenCalledWith('workspace-id', 'role-id', {
      userId: 'user-id',
      categories: [ToolCategory.ROLE],
    });
  });

  it('drops unknown categories rather than passing them to the registry', async () => {
    const { toolRegistry, buildToolIndex } = buildToolRegistry([ROLE_ENTRY]);

    await createGetToolCatalogTool(
      toolRegistry,
      'workspace-id',
      'role-id',
    ).execute({ categories: ['NOT_A_CATEGORY', ToolCategory.ROLE] });

    expect(buildToolIndex).toHaveBeenCalledWith('workspace-id', 'role-id', {
      categories: [ToolCategory.ROLE],
    });
  });
});
