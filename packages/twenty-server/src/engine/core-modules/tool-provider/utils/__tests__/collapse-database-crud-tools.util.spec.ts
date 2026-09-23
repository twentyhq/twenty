import { ToolCategory } from 'twenty-shared/ai';

import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { collapseDatabaseCrudTools } from 'src/engine/core-modules/tool-provider/utils/collapse-database-crud-tools.util';

const buildEntry = (
  operation: string,
  objectName: string,
  nameSegment: string,
): ToolIndexEntry =>
  ({
    name: `${operation}_${nameSegment}`,
    label: `${operation} ${nameSegment}`,
    description: `${operation} ${nameSegment}`,
    category: ToolCategory.DATABASE_CRUD,
    objectName,
    operation,
  }) as ToolIndexEntry;

const buildObjectEntries = (
  objectName: string,
  singular: string,
  plural: string,
  operations: string[],
): ToolIndexEntry[] =>
  operations.map((operation) =>
    buildEntry(
      operation,
      objectName,
      operation.endsWith('_one') ? singular : plural,
    ),
  );

const FULL_OPERATIONS = [
  'find_many',
  'find_one',
  'group_by',
  'create_one',
  'delete_one',
];
const READ_ONLY_OPERATIONS = ['find_many', 'find_one', 'group_by'];

describe('collapseDatabaseCrudTools', () => {
  it('groups objects by the operations they actually expose', () => {
    const collapsed = collapseDatabaseCrudTools([
      ...buildObjectEntries('person', 'person', 'people', FULL_OPERATIONS),
      ...buildObjectEntries(
        'workspaceMember',
        'workspace_member',
        'workspace_members',
        READ_ONLY_OPERATIONS,
      ),
    ]);

    expect(collapsed.objectGroups).toEqual([
      {
        operations: FULL_OPERATIONS,
        objects: [{ plural: 'people', singular: 'person' }],
      },
      {
        operations: READ_ONLY_OPERATIONS,
        objects: [
          { plural: 'workspace_members', singular: 'workspace_member' },
        ],
      },
    ]);
    expect(collapsed.toolCount).toBe(8);
  });

  it('puts objects sharing an operation set in one group', () => {
    const collapsed = collapseDatabaseCrudTools([
      ...buildObjectEntries('person', 'person', 'people', READ_ONLY_OPERATIONS),
      ...buildObjectEntries(
        'company',
        'company',
        'companies',
        READ_ONLY_OPERATIONS,
      ),
    ]);

    expect(collapsed.objectGroups).toHaveLength(1);
    expect(collapsed.objectGroups[0].objects).toEqual([
      { plural: 'companies', singular: 'company' },
      { plural: 'people', singular: 'person' },
    ]);
  });

  it('takes both name forms from the tool names, not from the object name', () => {
    const collapsed = collapseDatabaseCrudTools(
      buildObjectEntries('person', 'person', 'people', READ_ONLY_OPERATIONS),
    );

    expect(collapsed.objectGroups[0].objects[0]).toEqual({
      plural: 'people',
      singular: 'person',
    });
    expect(collapsed.exampleToolNames).toEqual([
      'find_many_people',
      'find_one_person',
    ]);
  });

  it('keeps entries without an object or operation as standalone tools', () => {
    const standalone = {
      name: 'list_logic_function_tools',
      label: 'List logic function tools',
      description: 'List logic function tools',
      category: ToolCategory.DATABASE_CRUD,
    } as ToolIndexEntry;

    const collapsed = collapseDatabaseCrudTools([
      ...buildObjectEntries('person', 'person', 'people', READ_ONLY_OPERATIONS),
      standalone,
    ]);

    expect(collapsed.standaloneTools).toEqual([standalone]);
    expect(collapsed.objectGroups).toHaveLength(1);
  });
});
