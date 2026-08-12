import { ToolCategory } from 'twenty-shared/ai';

import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';

const buildCrudToolIndexEntry = ({
  name,
  objectName,
  operation,
}: {
  name: string;
  objectName: string;
  operation: DatabaseCrudOperation;
}): ToolIndexEntry => ({
  name,
  objectName,
  operation,
  label: name,
  description: `${operation} ${objectName}`,
  category: ToolCategory.DATABASE_CRUD,
  executionRef: {
    kind: 'database_crud',
    objectNameSingular: objectName,
    operation,
  },
});

const COMPANY_TOOLS = [
  buildCrudToolIndexEntry({
    name: 'find_many_companies',
    objectName: 'company',
    operation: 'find_many',
  }),
  buildCrudToolIndexEntry({
    name: 'find_one_company',
    objectName: 'company',
    operation: 'find_one',
  }),
];

const WORKSPACE_MEMBER_TOOLS = [
  buildCrudToolIndexEntry({
    name: 'find_many_workspace_members',
    objectName: 'workspaceMember',
    operation: 'find_many',
  }),
  buildCrudToolIndexEntry({
    name: 'find_one_workspace_member',
    objectName: 'workspaceMember',
    operation: 'find_one',
  }),
];

describe('buildToolCatalogSection', () => {
  it('should show the snake_case name parts a camelCase object builds its tool names from', () => {
    const section = buildToolCatalogSection(
      [...COMPANY_TOOLS, ...WORKSPACE_MEMBER_TOOLS],
      [],
    );

    expect(section).toContain(
      '- `workspaceMember` → `workspace_member` / `workspace_members`',
    );
  });

  it('should keep the camelCase object name, which record URLs and filters still use', () => {
    const section = buildToolCatalogSection(WORKSPACE_MEMBER_TOOLS, []);

    expect(section).toContain('`workspaceMember`');
  });

  it('should pick a multi-word object for the worked example so snake_case is visible', () => {
    const section = buildToolCatalogSection(
      [...COMPANY_TOOLS, ...WORKSPACE_MEMBER_TOOLS],
      [],
    );

    expect(section).toContain(
      'e.g. `find_many_workspace_members` / `find_one_workspace_member`',
    );
  });

  it('should fall back to any object for the worked example when every name is one word', () => {
    const section = buildToolCatalogSection(COMPANY_TOOLS, []);

    expect(section).toContain(
      'e.g. `find_many_companies` / `find_one_company`',
    );
  });

  it('should read the plural name part from group_by, which has no _many suffix', () => {
    const section = buildToolCatalogSection(
      [
        buildCrudToolIndexEntry({
          name: 'group_by_people',
          objectName: 'person',
          operation: 'group_by',
        }),
        buildCrudToolIndexEntry({
          name: 'find_one_person',
          objectName: 'person',
          operation: 'find_one',
        }),
      ],
      [],
    );

    expect(section).toContain('- `person` → `person` / `people`');
  });

  it('should list an object that only exposes one name part', () => {
    const section = buildToolCatalogSection(
      [
        buildCrudToolIndexEntry({
          name: 'find_many_note_targets',
          objectName: 'noteTarget',
          operation: 'find_many',
        }),
      ],
      [],
    );

    expect(section).toContain('- `noteTarget` → `note_targets`');
  });
});
