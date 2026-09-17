// oxlint-disable twenty/folder-structure -- Utility specs intentionally live beside their implementation.
import { buildGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/utils/buildGlobalRecordCreationCommandMenuItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import {
  EngineComponentKey,
  MetadataWritability,
} from '~/generated-metadata/graphql';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';

const createRecordCommand = mockedCommandMenuItems.find(
  (item) =>
    item.engineComponentKey === EngineComponentKey.CREATE_NEW_RECORD &&
    !item.availabilityObjectMetadataId,
)!;

const objects = [
  { id: 'company', labelSingular: 'company', icon: 'IconBuildingSkyscraper' },
  { id: 'task', labelSingular: 'task', icon: 'IconCheckbox' },
  { id: 'remote', labelSingular: 'remote', isRemote: true },
  { id: 'readonly', labelSingular: 'readonly', isUIEditable: false },
  { id: 'internal', labelSingular: 'internal', isUICreatable: false },
  {
    id: 'system',
    labelSingular: 'system',
    writability: MetadataWritability.SYSTEM,
  },
  {
    id: 'application',
    labelSingular: 'application',
    writability: MetadataWritability.APPLICATION,
  },
].map((objectMetadataItem) => ({
  icon: null,
  writability: MetadataWritability.OPEN,
  isUICreatable: true,
  isUIEditable: true,
  isRemote: false,
  ...objectMetadataItem,
}));

it('offers every creatable object with its label, icon, and creation target', () => {
  const items = buildGlobalRecordCreationCommandMenuItems({
    activeObjectMetadataItems: objects,
    objectPermissionsByObjectMetadataId: {},
    createRecordCommand,
    getLabel: (label) => `Create ${label}`,
  });

  expect(items).toEqual([
    expect.objectContaining({
      label: 'Create Company',
      icon: 'IconBuildingSkyscraper',
      creationTargetObjectMetadataId: 'company',
      isPinned: false,
    }),
    expect.objectContaining({
      label: 'Create Task',
      icon: 'IconCheckbox',
      creationTargetObjectMetadataId: 'task',
      isPinned: false,
    }),
  ]);
  expect(new Set(items.map((item) => item.id)).size).toBe(2);
});

it('does not offer objects without read or write permissions', () => {
  const items = buildGlobalRecordCreationCommandMenuItems({
    activeObjectMetadataItems: objects,
    objectPermissionsByObjectMetadataId: {
      company: {
        ...getObjectPermissionsForObject({}, 'company'),
        canUpdateObjectRecords: false,
      },
      task: {
        ...getObjectPermissionsForObject({}, 'task'),
        canReadObjectRecords: false,
      },
    },
    createRecordCommand,
    getLabel: (label) => `Create ${label}`,
  });

  expect(items).toEqual([]);
});
