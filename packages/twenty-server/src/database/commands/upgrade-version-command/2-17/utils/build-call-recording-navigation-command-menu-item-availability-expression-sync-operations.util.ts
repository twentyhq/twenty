import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { NAVIGATION_COMMAND_UUID_NAMESPACE } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const LEGACY_CALL_RECORDING_NAVIGATION_AVAILABILITY_EXPRESSION =
  'featureFlags.IS_CALL_RECORDING_ENABLED and targetObjectReadPermissions.callRecording';

export const CALL_RECORDING_NAVIGATION_AVAILABILITY_EXPRESSION =
  'targetObjectReadPermissions.callRecording';

const CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.callRecording.universalIdentifier;

const CALL_RECORDING_NAVIGATION_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER = v5(
  CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  NAVIGATION_COMMAND_UUID_NAMESPACE,
);

export const buildCallRecordingNavigationCommandMenuItemAvailabilityExpressionSyncOperations =
  ({
    existingFlatCommandMenuItemMaps,
    existingFlatObjectMetadataMaps,
    now,
  }: {
    existingFlatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
    existingFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    now: string;
  }): FlatEntityToCreateDeleteUpdate<'commandMenuItem'> => {
    const existingCallRecordingObjectMetadata =
      existingFlatObjectMetadataMaps.byUniversalIdentifier[
        CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER
      ];
    const existingCallRecordingNavigationCommandMenuItem =
      existingFlatCommandMenuItemMaps.byUniversalIdentifier[
        CALL_RECORDING_NAVIGATION_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER
      ];

    if (
      !isDefined(existingCallRecordingObjectMetadata) ||
      !isDefined(existingCallRecordingNavigationCommandMenuItem) ||
      existingCallRecordingNavigationCommandMenuItem.conditionalAvailabilityExpression !==
        LEGACY_CALL_RECORDING_NAVIGATION_AVAILABILITY_EXPRESSION
    ) {
      return {
        flatEntityToCreate: [],
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      };
    }

    return {
      flatEntityToCreate: [],
      flatEntityToDelete: [],
      flatEntityToUpdate: [
        {
          ...existingCallRecordingNavigationCommandMenuItem,
          conditionalAvailabilityExpression:
            CALL_RECORDING_NAVIGATION_AVAILABILITY_EXPRESSION,
          updatedAt: now,
        },
      ],
    };
  };
