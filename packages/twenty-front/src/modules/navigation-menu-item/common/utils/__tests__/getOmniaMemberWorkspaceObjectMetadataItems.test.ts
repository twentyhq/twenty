import { getOmniaMemberWorkspaceObjectMetadataItems } from '@/navigation-menu-item/common/utils/getOmniaMemberWorkspaceObjectMetadataItems';

const createObjectMetadataItem = (overrides = {}) => ({
  id: 'object-id',
  universalIdentifier: 'object-universal-identifier',
  nameSingular: 'person',
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
  description: null,
  icon: 'IconUser',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isUIReadOnly: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  labelIdentifierFieldMetadataId: 'field-id',
  applicationId: undefined,
  shortcut: undefined,
  isLabelSyncedWithName: false,
  isSearchable: true,
  duplicateCriteria: [],
  indexMetadatas: [],
  fields: [],
  readableFields: [],
  updatableFields: [],
  ...overrides,
});

describe('getOmniaMemberWorkspaceObjectMetadataItems', () => {
  it('returns Omnia member workspace objects in the expected order', () => {
    const omniaMemberWorkspaceObjectMetadataItems =
      getOmniaMemberWorkspaceObjectMetadataItems([
        createObjectMetadataItem({
          id: 'task-id',
          nameSingular: 'task',
          namePlural: 'tasks',
          labelSingular: 'Task',
          labelPlural: 'Tasks',
        }),
        createObjectMetadataItem({
          id: 'call-id',
          nameSingular: 'call',
          namePlural: 'calls',
          labelSingular: 'Call',
          labelPlural: 'Calls',
        }),
        createObjectMetadataItem({
          id: 'person-id',
          nameSingular: 'person',
          namePlural: 'people',
          labelSingular: 'Lead',
          labelPlural: 'Leads',
        }),
        createObjectMetadataItem({
          id: 'note-id',
          nameSingular: 'note',
          namePlural: 'notes',
          labelSingular: 'Note',
          labelPlural: 'Notes',
        }),
        createObjectMetadataItem({
          id: 'carrier-id',
          nameSingular: 'carrier',
          namePlural: 'carriers',
          labelSingular: 'Carrier',
          labelPlural: 'Carriers',
        }),
        createObjectMetadataItem({
          id: 'policy-id',
          nameSingular: 'policy',
          namePlural: 'policies',
          labelSingular: 'Policy',
          labelPlural: 'Policies',
        }),
      ]);

    expect(
      omniaMemberWorkspaceObjectMetadataItems.map(
        (objectMetadataItem) => objectMetadataItem.nameSingular,
      ),
    ).toEqual(['person', 'call', 'policy', 'note', 'task']);
  });
});
