import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

// Maps "Go to" action keys to the object they navigate to
const GO_TO_ACTION_OBJECT_MAP: Record<string, CoreObjectNameSingular> = {
  [NoSelectionRecordActionKeys.GO_TO_PEOPLE]: CoreObjectNameSingular.Person,
  [NoSelectionRecordActionKeys.GO_TO_COMPANIES]: CoreObjectNameSingular.Company,
  [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]:
    CoreObjectNameSingular.Opportunity,
  [NoSelectionRecordActionKeys.GO_TO_TASKS]: CoreObjectNameSingular.Task,
  [NoSelectionRecordActionKeys.GO_TO_NOTES]: CoreObjectNameSingular.Note,
  [NoSelectionRecordActionKeys.GO_TO_WORKFLOWS]:
    CoreObjectNameSingular.Workflow,
  [NoSelectionRecordActionKeys.GO_TO_DASHBOARDS]:
    CoreObjectNameSingular.Dashboard,
};

export const resolveGoToActionLabels = (
  actions: ActionConfig[],
  objectMetadataItems: ObjectMetadataItem[],
): ActionConfig[] => {
  return actions.map((action) => {
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
