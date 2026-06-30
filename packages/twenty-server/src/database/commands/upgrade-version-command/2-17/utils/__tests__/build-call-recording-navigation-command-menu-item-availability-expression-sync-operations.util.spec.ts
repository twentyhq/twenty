import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  buildCallRecordingNavigationCommandMenuItemAvailabilityExpressionSyncOperations,
  CALL_RECORDING_NAVIGATION_AVAILABILITY_EXPRESSION,
  LEGACY_CALL_RECORDING_NAVIGATION_AVAILABILITY_EXPRESSION,
} from 'src/database/commands/upgrade-version-command/2-17/utils/build-call-recording-navigation-command-menu-item-availability-expression-sync-operations.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { buildNavigationFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const APPLICATION_ID = 'application-id';
const WORKSPACE_ID = 'workspace-id';
const CREATED_AT = '2026-06-01T00:00:00.000Z';
const NOW = '2026-06-25T00:00:00.000Z';

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
  universalIdentifiersByApplicationId: {
    [APPLICATION_ID]: flatCommandMenuItems.map(
      (flatCommandMenuItem) => flatCommandMenuItem.universalIdentifier,
    ),
  },
});

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
  universalIdentifiersByApplicationId: {
    [APPLICATION_ID]: flatObjectMetadatas.map(
      (flatObjectMetadata) => flatObjectMetadata.universalIdentifier,
    ),
  },
});

const buildCallRecordingObjectMetadataMaps = () =>
  buildFlatObjectMetadataMaps([
    getFlatObjectMetadataMock({
      id: 'call-recording-object-metadata-id',
      universalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
      nameSingular: 'callRecording',
      namePlural: 'callRecordings',
      applicationId: APPLICATION_ID,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      workspaceId: WORKSPACE_ID,
    }),
  ]);

const buildCallRecordingNavigationCommandMenuItem = ({
  conditionalAvailabilityExpression,
}: {
  conditionalAvailabilityExpression: string | null;
}): FlatCommandMenuItem => ({
  ...buildNavigationFlatCommandMenuItem({
    objectMetadata: {
      id: 'call-recording-object-metadata-id',
      universalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
      nameSingular: 'callRecording',
      shortcut: null,
    },
    commandMenuItemId: 'call-recording-navigation-command-menu-item-id',
    applicationId: APPLICATION_ID,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceId: WORKSPACE_ID,
    position: 0,
    now: CREATED_AT,
  }),
  conditionalAvailabilityExpression,
});

describe('buildCallRecordingNavigationCommandMenuItemAvailabilityExpressionSyncOperations', () => {
  it('rewrites the legacy call recording feature-flag gate to the read-permission gate', () => {
    const legacyCallRecordingNavigationCommandMenuItem =
      buildCallRecordingNavigationCommandMenuItem({
        conditionalAvailabilityExpression:
          LEGACY_CALL_RECORDING_NAVIGATION_AVAILABILITY_EXPRESSION,
      });

    const result =
      buildCallRecordingNavigationCommandMenuItemAvailabilityExpressionSyncOperations(
        {
          existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
            legacyCallRecordingNavigationCommandMenuItem,
          ]),
          existingFlatObjectMetadataMaps: buildCallRecordingObjectMetadataMaps(),
          now: NOW,
        },
      );

    expect(result.flatEntityToCreate).toHaveLength(0);
    expect(result.flatEntityToDelete).toHaveLength(0);
    expect(result.flatEntityToUpdate).toHaveLength(1);
    expect(result.flatEntityToUpdate[0]).toMatchObject({
      id: legacyCallRecordingNavigationCommandMenuItem.id,
      conditionalAvailabilityExpression:
        CALL_RECORDING_NAVIGATION_AVAILABILITY_EXPRESSION,
      updatedAt: NOW,
    });
  });

  it('does not update the command menu item when the expression is already synced', () => {
    const syncedCallRecordingNavigationCommandMenuItem =
      buildCallRecordingNavigationCommandMenuItem({
        conditionalAvailabilityExpression:
          CALL_RECORDING_NAVIGATION_AVAILABILITY_EXPRESSION,
      });

    const result =
      buildCallRecordingNavigationCommandMenuItemAvailabilityExpressionSyncOperations(
        {
          existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
            syncedCallRecordingNavigationCommandMenuItem,
          ]),
          existingFlatObjectMetadataMaps: buildCallRecordingObjectMetadataMaps(),
          now: NOW,
        },
      );

    expect(result.flatEntityToUpdate).toHaveLength(0);
  });

  it('does not update unrelated command menu item availability expressions', () => {
    const customCallRecordingNavigationCommandMenuItem =
      buildCallRecordingNavigationCommandMenuItem({
        conditionalAvailabilityExpression:
          'targetObjectReadPermissions.callRecording and permissionFlags.DATA_MODEL',
      });

    const result =
      buildCallRecordingNavigationCommandMenuItemAvailabilityExpressionSyncOperations(
        {
          existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
            customCallRecordingNavigationCommandMenuItem,
          ]),
          existingFlatObjectMetadataMaps: buildCallRecordingObjectMetadataMaps(),
          now: NOW,
        },
      );

    expect(result.flatEntityToUpdate).toHaveLength(0);
  });

  it('does not update when the call recording object metadata is missing', () => {
    const legacyCallRecordingNavigationCommandMenuItem =
      buildCallRecordingNavigationCommandMenuItem({
        conditionalAvailabilityExpression:
          LEGACY_CALL_RECORDING_NAVIGATION_AVAILABILITY_EXPRESSION,
      });

    const result =
      buildCallRecordingNavigationCommandMenuItemAvailabilityExpressionSyncOperations(
        {
          existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
            legacyCallRecordingNavigationCommandMenuItem,
          ]),
          existingFlatObjectMetadataMaps: buildFlatObjectMetadataMaps([]),
          now: NOW,
        },
      );

    expect(result.flatEntityToUpdate).toHaveLength(0);
  });

  it('does not update when the call recording navigation command menu item is missing', () => {
    const result =
      buildCallRecordingNavigationCommandMenuItemAvailabilityExpressionSyncOperations(
        {
          existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([]),
          existingFlatObjectMetadataMaps: buildCallRecordingObjectMetadataMaps(),
          now: NOW,
        },
      );

    expect(result).toEqual({
      flatEntityToCreate: [],
      flatEntityToDelete: [],
      flatEntityToUpdate: [],
    });
  });
});
