import { ToolCategory } from 'twenty-shared/ai';

import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';

const buildCrudEntry = (
  operation: string,
  objectName: string,
  nameSegment: string,
): ToolIndexEntry =>
  ({
    name: `${operation}_${nameSegment}`,
    label: operation,
    description: operation,
    category: ToolCategory.DATABASE_CRUD,
    objectName,
    operation,
  }) as ToolIndexEntry;

const buildActionEntry = (name: string): ToolIndexEntry =>
  ({
    name,
    label: name,
    description: name,
    category: ToolCategory.ACTION,
  }) as ToolIndexEntry;

describe('buildToolCatalogSection', () => {
  it('renders record tools as operations per object group, not one line per tool', () => {
    const section = buildToolCatalogSection(
      [
        buildCrudEntry('find_many', 'person', 'people'),
        buildCrudEntry('find_one', 'person', 'person'),
        buildCrudEntry('create_one', 'person', 'person'),
        buildCrudEntry('find_many', 'workspaceMember', 'workspace_members'),
        buildCrudEntry('find_one', 'workspaceMember', 'workspace_member'),
      ],
      [],
    );

    expect(section).toContain('`find_many` | `find_one` | `create_one`');
    expect(section).toContain('- `people` / `person`');
    expect(section).toContain('`find_many` | `find_one`');
    expect(section).toContain('- `workspace_members` / `workspace_member`');
    expect(section).toContain(
      'Tool name = operation + object name. *_many_* operations use the plural form, *_one_* use the singular form. e.g. `find_many_people` / `find_one_person`',
    );
    expect(section).not.toContain('- `find_many_people`');
  });

  it('does not advertise an operation for an object that lacks it', () => {
    const section = buildToolCatalogSection(
      [
        buildCrudEntry('find_many', 'person', 'people'),
        buildCrudEntry('create_one', 'person', 'person'),
        buildCrudEntry('find_many', 'workspaceMember', 'workspace_members'),
      ],
      [],
    );

    const workspaceMemberGroup = section
      .split('\n\n')
      .find((block) => block.includes('workspace_members'));

    expect(workspaceMemberGroup).toBeDefined();
    expect(workspaceMemberGroup).not.toContain('create_one');
  });

  it('marks preloaded tools and counts the whole catalog', () => {
    const section = buildToolCatalogSection(
      [buildActionEntry('send_email'), buildActionEntry('search_help_center')],
      ['search_help_center'],
    );

    expect(section).toContain('You have access to 2 tools');
    expect(section).toContain('- `search_help_center` ✓');
    expect(section).toContain('- `send_email`');
  });
});
