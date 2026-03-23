import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type MessageDescriptor } from '@lingui/core';
import { type Nullable } from 'twenty-shared/types';

// Maps "Go to" action keys to the object they navigate to
const GO_TO_ACTION_OBJECT_MAP: Record<string, CoreObjectNameSingular> = {
  [NoSelectionRecordCommandKeys.GO_TO_PEOPLE]: CoreObjectNameSingular.Person,
  [NoSelectionRecordCommandKeys.GO_TO_COMPANIES]:
    CoreObjectNameSingular.Company,
  [NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES]:
    CoreObjectNameSingular.Opportunity,
  [NoSelectionRecordCommandKeys.GO_TO_TASKS]: CoreObjectNameSingular.Task,
  [NoSelectionRecordCommandKeys.GO_TO_NOTES]: CoreObjectNameSingular.Note,
  [NoSelectionRecordCommandKeys.GO_TO_WORKFLOWS]:
    CoreObjectNameSingular.Workflow,
  [NoSelectionRecordCommandKeys.GO_TO_DASHBOARDS]:
    CoreObjectNameSingular.Dashboard,
};

// OMNIA-CUSTOM: resolves "Go to" labels from object metadata and filters deactivated objects
export const resolveGoToActionLabels = <
  TAction extends {
    key: string;
    label: Nullable<string | MessageDescriptor>;
    shortLabel?: Nullable<string | MessageDescriptor>;
  },
>(
  actions: TAction[],
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'nameSingular' | 'labelPlural' | 'isActive'
  >[],
): TAction[] => {
  return actions
    .filter((action) => {
      const targetObjectNameSingular = GO_TO_ACTION_OBJECT_MAP[action.key];

      if (!targetObjectNameSingular) {
        return true;
      }

      const targetObjectMetadata = objectMetadataItems.find(
        (item) => item.nameSingular === targetObjectNameSingular,
      );

      // Keep the item if we can't find the target (shouldn't happen), filter if deactivated
      return !targetObjectMetadata || targetObjectMetadata.isActive;
    })
    .map((action) => {
      const targetObjectNameSingular = GO_TO_ACTION_OBJECT_MAP[action.key];

      if (!targetObjectNameSingular) {
        return action;
      }

      const targetObjectMetadata = objectMetadataItems.find(
        (item) => item.nameSingular === targetObjectNameSingular,
      );

      if (!targetObjectMetadata) {
        return action;
      }

      return {
        ...action,
        label: `Go to ${targetObjectMetadata.labelPlural}`,
        shortLabel: targetObjectMetadata.labelPlural,
      };
    });
};
