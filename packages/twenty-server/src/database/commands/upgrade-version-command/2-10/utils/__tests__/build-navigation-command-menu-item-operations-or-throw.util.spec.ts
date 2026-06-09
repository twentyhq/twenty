import { v5 } from 'uuid';

import { buildNavigationCommandMenuItemOperationsOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/build-navigation-command-menu-item-operations-or-throw.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import {
  buildNavigationFlatCommandMenuItem,
  NAVIGATION_COMMAND_UUID_NAMESPACE,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const APPLICATION_ID = 'application-id';
const WORKSPACE_ID = 'workspace-id';
const NOW = '2026-06-04T00:00:00.000Z';

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
    applicationUniversalIdentifier: APPLICATION_ID,
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
      objectMetadatasForNavigation: [objectMetadata],
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

  it('uses the provided object id in the navigation payload', () => {
    const objectMetadata = getFlatObjectMetadataMock({
      id: 'existing-call-recording-object-id',
      universalIdentifier: 'call-recording',
      nameSingular: 'callRecording',
      namePlural: 'callRecordings',
    });

    const result = buildNavigationCommandMenuItemOperationsOrThrow({
      existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([]),
      objectMetadatasForNavigation: [objectMetadata],
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      now: NOW,
      renamedCollisionObjectMetadatas: [],
    });

    expect(result.flatEntityToCreate[0].payload).toEqual({
      objectMetadataItemId: 'existing-call-recording-object-id',
    });
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
      objectMetadatasForNavigation: [objectMetadata],
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
      objectMetadatasForNavigation: [objectMetadata],
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
      objectMetadatasForNavigation: [objectMetadata],
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      now: NOW,
      renamedCollisionObjectMetadatas: [],
    });

    expect(result.flatEntityToCreate[0].position).toBe(6);
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
      objectMetadatasForNavigation: [],
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
      objectMetadatasForNavigation: [],
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
