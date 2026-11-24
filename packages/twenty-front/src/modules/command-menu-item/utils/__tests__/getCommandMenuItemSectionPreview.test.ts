import { getCommandMenuItemSectionPreview } from '@/command-menu-item/utils/getCommandMenuItemSectionPreview';

const OBJECT_METADATA_ITEMS = [
  { id: 'company-id', labelSingular: 'Company', labelPlural: 'Companies' },
  { id: 'person-id', labelSingular: 'Person', labelPlural: 'People' },
  { id: 'task-id', labelSingular: 'Task', labelPlural: 'Tasks' },
];

describe('getCommandMenuItemSectionPreview', () => {
  it('uses plural object labels in Go to and the full label otherwise', () => {
    expect(
      getCommandMenuItemSectionPreview({
        section: 'GO_TO',
        commandMenuItems: [
          { label: 'Go to Settings' },
          {
            label: 'Go to Companies',
            navigationTargetObjectMetadataId: 'company-id',
          },
          {
            label: 'Go to People',
            navigationTargetObjectMetadataId: 'person-id',
          },
          { label: 'Go to Tasks', navigationTargetObjectMetadataId: 'task-id' },
        ],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe('Go to Settings, Companies, People…');
  });

  it('uses singular object labels in Create record', () => {
    expect(
      getCommandMenuItemSectionPreview({
        section: 'CREATE_RECORD',
        commandMenuItems: [
          {
            label: 'Create Company',
            creationTargetObjectMetadataId: 'company-id',
          },
          { label: 'Create Task', creationTargetObjectMetadataId: 'task-id' },
        ],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe('Company, Task');
  });

  it('falls back to the row label when the object is unknown', () => {
    expect(
      getCommandMenuItemSectionPreview({
        section: 'CREATE_RECORD',
        commandMenuItems: [
          {
            label: 'Create Widget',
            creationTargetObjectMetadataId: 'unknown-id',
          },
        ],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe('Create Widget');
  });
});
