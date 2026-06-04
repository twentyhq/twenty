import { v5 } from 'uuid';

import { buildNavigationCommandMenuItemOperationsOrThrow } from 'src/database/commands/upgrade-version-command/2-9/utils/build-navigation-command-menu-item-operations-or-throw.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import {
  buildNavigationFlatCommandMenuItem,
  NAVIGATION_COMMAND_UUID_NAMESPACE,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const APPLICATION_ID = 'application-id';
const WORKSPACE_ID = 'workspace-id';
const NOW = '2026-06-04T00:00:00.000Z';

const buildFlatObjectMetadataMaps = (
  flatObjectMetadatas: FlatObjectMetadata[],
): FlatEntityMaps<FlatObjectMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatObjectMetadatas.map((flatObjectMetadata) => [
      flatObjectMetadata.universalIdentifier,
      flatObjectMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatObjectMetadatas.map((flatObjectMetadata) => [
      flatObjectMetadata.id,
      flatObjectMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildFlatCommandMenuItemMaps = (
  flatCommandMenuItems: FlatCommandMenuItem[],
): FlatEntityMaps<FlatCommandMenuItem> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatCommandMenuItems.map((flatCommandMenuItem) => [
      flatCommandMenuItem.universalIdentifier,
      flatCommandMenuItem,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatCommandMenuItems.map((flatCommandMenuItem) => [
      flatCommandMenuItem.id,
      flatCommandMenuItem.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildExistingNavigationItem = ({
  objectId,
  objectUniversalIdentifier,
  nameSingular,
  position,
}: {
  objectId: string;
  objectUniversalIdentifier: string;
  nameSingular: string;
  position: number;
}): FlatCommandMenuItem =>
  buildNavigationFlatCommandMenuItem({
    objectMetadata: {
      id: objectId,
      universalIdentifier: objectUniversalIdentifier,
      nameSingular,
      shortcut: null,
    },
    commandMenuItemId: `command-menu-item-${objectUniversalIdentifier}`,
    applicationId: APPLICATION_ID,
    workspaceId: WORKSPACE_ID,
    position,
    now: NOW,
  });

describe('buildNavigationCommandMenuItemOperationsOrThrow', () => {
  it('creates a navigation item for an active object that has no existing navigation', () => {
    const objectMetadata = getFlatObjectMetadataMock({
      universalIdentifier: 'call-recording',
      nameSingular: 'callRecording',
      namePlural: 'callRecordings',
    });

    const result = buildNavigationCommandMenuItemOperationsOrThrow({
      existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([]),
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps([objectMetadata]),
      objectMetadataUniversalIdentifiers: ['call-recording'],
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      now: NOW,
      renamedCollisionObjectMetadatas: [],
    });

    expect(result.flatEntityToCreate).toHaveLength(1);
    expect(result.flatEntityToCreate[0].universalIdentifier).toBe(
      v5('call-recording', NAVIGATION_COMMAND_UUID_NAMESPACE),
    );
    expect(result.flatEntityToCreate[0].position).toBe(0);
    expect(result.flatEntityToCreate[0].payload).toEqual({
      objectMetadataItemId: objectMetadata.id,
    });
    expect(result.flatEntityToUpdate).toHaveLength(0);
    expect(result.flatEntityToDelete).toHaveLength(0);
  });

  it('does not create a navigation item for an inactive object', () => {
    const objectMetadata = getFlatObjectMetadataMock({
      universalIdentifier: 'call-recording',
      nameSingular: 'callRecording',
      namePlural: 'callRecordings',
      isActive: false,
    });

    const result = buildNavigationCommandMenuItemOperationsOrThrow({
      existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([]),
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps([objectMetadata]),
      objectMetadataUniversalIdentifiers: ['call-recording'],
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      now: NOW,
      renamedCollisionObjectMetadatas: [],
    });

    expect(result.flatEntityToCreate).toHaveLength(0);
  });

  it('does not recreate a navigation item that already exists (idempotent)', () => {
    const objectMetadata = getFlatObjectMetadataMock({
      universalIdentifier: 'call-recording',
      nameSingular: 'callRecording',
      namePlural: 'callRecordings',
    });
    const existingNavigationItem = buildExistingNavigationItem({
      objectId: objectMetadata.id,
      objectUniversalIdentifier: 'call-recording',
      nameSingular: 'callRecording',
      position: 0,
    });

    const result = buildNavigationCommandMenuItemOperationsOrThrow({
      existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        existingNavigationItem,
      ]),
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps([objectMetadata]),
      objectMetadataUniversalIdentifiers: ['call-recording'],
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      now: NOW,
      renamedCollisionObjectMetadatas: [],
    });

    expect(result.flatEntityToCreate).toHaveLength(0);
  });

  it('positions the new navigation item after the highest existing position', () => {
    const objectMetadata = getFlatObjectMetadataMock({
      universalIdentifier: 'call-recording',
      nameSingular: 'callRecording',
      namePlural: 'callRecordings',
    });
    const existingNavigationItems = [
      buildExistingNavigationItem({
        objectId: 'other-object-1-id',
        objectUniversalIdentifier: 'other-object-1',
        nameSingular: 'otherObjectOne',
        position: 0,
      }),
      buildExistingNavigationItem({
        objectId: 'other-object-2-id',
        objectUniversalIdentifier: 'other-object-2',
        nameSingular: 'otherObjectTwo',
        position: 5,
      }),
    ];

    const result = buildNavigationCommandMenuItemOperationsOrThrow({
      existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(
        existingNavigationItems,
      ),
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps([objectMetadata]),
      objectMetadataUniversalIdentifiers: ['call-recording'],
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      now: NOW,
      renamedCollisionObjectMetadatas: [],
    });

    expect(result.flatEntityToCreate[0].position).toBe(6);
  });

  it('throws when the object metadata is absent from the provided maps', () => {
    expect(() =>
      buildNavigationCommandMenuItemOperationsOrThrow({
        existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([]),
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([]),
        objectMetadataUniversalIdentifiers: ['call-recording'],
        applicationId: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
        now: NOW,
        renamedCollisionObjectMetadatas: [],
      }),
    ).toThrow('Could not find object metadata call-recording');
  });

  it('rewrites the stale availability expression of a renamed object navigation item', () => {
    const existingNavigationItem = buildExistingNavigationItem({
      objectId: 'colliding-object-id',
      objectUniversalIdentifier: 'colliding-object',
      nameSingular: 'callRecording',
      position: 0,
    });

    const result = buildNavigationCommandMenuItemOperationsOrThrow({
      existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        existingNavigationItem,
      ]),
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps([]),
      objectMetadataUniversalIdentifiers: [],
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      now: NOW,
      renamedCollisionObjectMetadatas: [
        {
          universalIdentifier: 'colliding-object',
          nameSingular: 'callRecordingOld',
        },
      ],
    });

    expect(result.flatEntityToUpdate).toHaveLength(1);
    expect(result.flatEntityToUpdate[0].conditionalAvailabilityExpression).toBe(
      'targetObjectReadPermissions.callRecordingOld',
    );
    expect(result.flatEntityToUpdate[0].updatedAt).toBe(NOW);
    expect(result.flatEntityToCreate).toHaveLength(0);
  });

  it('does not produce an update when a renamed object has no existing navigation item', () => {
    const result = buildNavigationCommandMenuItemOperationsOrThrow({
      existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([]),
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps([]),
      objectMetadataUniversalIdentifiers: [],
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      now: NOW,
      renamedCollisionObjectMetadatas: [
        {
          universalIdentifier: 'colliding-object',
          nameSingular: 'callRecordingOld',
        },
      ],
    });

    expect(result.flatEntityToUpdate).toHaveLength(0);
  });
});
