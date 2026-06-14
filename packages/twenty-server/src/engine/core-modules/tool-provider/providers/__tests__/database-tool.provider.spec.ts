import { type ObjectPermissions } from 'twenty-shared/types';

import { DatabaseToolProvider } from 'src/engine/core-modules/tool-provider/providers/database-tool.provider';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const roleId = 'role-id';
const workspaceId = 'workspace-id';

const allObjectPermissions: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const createFlatObject = (
  overrides: Partial<FlatObjectMetadata> &
    Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'>,
) =>
  getFlatObjectMetadataMock({
    universalIdentifier: overrides.nameSingular,
    labelSingular: overrides.nameSingular,
    labelPlural: overrides.namePlural,
    ...overrides,
  });

describe('DatabaseToolProvider', () => {
  const generateDescriptorNames = async (objects: FlatObjectMetadata[]) => {
    const flatObjectMetadataMaps =
      createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>;

    for (const object of objects) {
      flatObjectMetadataMaps.byUniversalIdentifier[object.universalIdentifier] =
        object;
      flatObjectMetadataMaps.universalIdentifierById[object.id] =
        object.universalIdentifier;
    }

    const workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        rolesPermissions: {
          [roleId]: Object.fromEntries(
            objects.map((object) => [object.id, allObjectPermissions]),
          ),
        },
      }),
    } as unknown as WorkspaceCacheService;

    const flatEntityMapsCacheService = {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      }),
    } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService;

    const provider = new DatabaseToolProvider(
      workspaceCacheService,
      flatEntityMapsCacheService,
    );

    const descriptors = (await provider.generateDescriptors(
      {
        workspaceId,
        roleId,
        rolePermissionConfig: { unionOf: [roleId] },
      },
      { includeSchemas: false },
    )) as ToolDescriptor[];

    return descriptors.map((descriptor) => descriptor.name);
  };

  it('advertises write tools for join/system objects allowed by automation', async () => {
    const descriptorNames = await generateDescriptorNames([
      createFlatObject({
        nameSingular: 'noteTarget',
        namePlural: 'noteTargets',
        isSystem: true,
      }),
      createFlatObject({
        nameSingular: 'taskTarget',
        namePlural: 'taskTargets',
        isSystem: true,
      }),
      createFlatObject({
        nameSingular: 'attachment',
        namePlural: 'attachments',
        isSystem: true,
      }),
      createFlatObject({
        nameSingular: 'timelineActivity',
        namePlural: 'timelineActivities',
        isSystem: true,
      }),
      createFlatObject({
        nameSingular: 'person',
        namePlural: 'people',
      }),
    ]);

    expect(descriptorNames).toEqual(
      expect.arrayContaining([
        'create_one_note_target',
        'create_many_note_targets',
        'update_one_note_target',
        'update_many_note_targets',
        'delete_one_note_target',
        'create_one_task_target',
        'create_one_attachment',
        'create_one_timeline_activity',
        'create_one_person',
      ]),
    );
  });

  it('does not advertise write tools for objects blocked from automation', async () => {
    const descriptorNames = await generateDescriptorNames([
      createFlatObject({
        nameSingular: 'workspaceMember',
        namePlural: 'workspaceMembers',
        isSystem: true,
      }),
      createFlatObject({
        nameSingular: 'message',
        namePlural: 'messages',
        isSystem: true,
      }),
      createFlatObject({
        nameSingular: 'calendarEvent',
        namePlural: 'calendarEvents',
        isSystem: true,
      }),
      createFlatObject({
        nameSingular: 'dashboard',
        namePlural: 'dashboards',
      }),
    ]);

    expect(descriptorNames).toEqual(
      expect.arrayContaining([
        'find_many_workspace_members',
        'find_many_messages',
        'find_many_calendar_events',
        'find_many_dashboards',
      ]),
    );

    expect(descriptorNames).toEqual(
      expect.not.arrayContaining([
        'create_one_workspace_member',
        'update_one_workspace_member',
        'delete_one_workspace_member',
        'create_one_message',
        'update_one_message',
        'delete_one_message',
        'create_one_calendar_event',
        'update_one_calendar_event',
        'delete_one_calendar_event',
        'create_one_dashboard',
        'update_one_dashboard',
        'delete_one_dashboard',
      ]),
    );
  });
});
