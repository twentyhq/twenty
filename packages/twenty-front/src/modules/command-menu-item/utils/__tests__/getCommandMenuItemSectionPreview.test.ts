import { getCommandMenuItemSectionPreview } from '@/command-menu-item/utils/getCommandMenuItemSectionPreview';

const OBJECT_METADATA_ITEMS = [
  { id: 'company-id', labelSingular: 'Company', labelPlural: 'Companies' },
  { id: 'person-id', labelSingular: 'Person', labelPlural: 'People' },
  { id: 'task-id', labelSingular: 'Task', labelPlural: 'Tasks' },
];

describe('getCommandMenuItemSectionPreview', () => {
  it('uses plural object labels in Go to and drops the heading from other rows', () => {
    expect(
      getCommandMenuItemSectionPreview({
        section: 'GO_TO',
        sectionHeading: 'Go to',
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
    ).toBe('Settings, Companies, People…');
  });

  it('keeps a label that does not start with the heading whole', () => {
    expect(
      getCommandMenuItemSectionPreview({
        section: 'GO_TO',
        sectionHeading: 'Aller à',
        commandMenuItems: [
          { label: 'Ouvrir les paramètres' },
          { label: 'Go to Settings' },
        ],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe('Ouvrir les paramètres, Go to Settings');
  });

  it('matches the heading regardless of case and keeps the rest as written', () => {
    expect(
      getCommandMenuItemSectionPreview({
        section: 'GO_TO',
        sectionHeading: 'Go to',
        commandMenuItems: [
          { label: 'GO TO Experience Settings' },
          { label: 'go to apps preferences' },
        ],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe('Experience Settings, apps preferences');
  });

  it('keeps a label equal to the heading alone whole', () => {
    expect(
      getCommandMenuItemSectionPreview({
        section: 'GO_TO',
        sectionHeading: 'Go to',
        commandMenuItems: [{ label: 'Go to' }, { label: 'Go to ' }],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBe('Go to, Go to ');
  });

  it('uses singular object labels in Create record', () => {
    expect(
      getCommandMenuItemSectionPreview({
        section: 'CREATE_RECORD',
        sectionHeading: 'Create record',
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
        sectionHeading: 'Create record',
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
