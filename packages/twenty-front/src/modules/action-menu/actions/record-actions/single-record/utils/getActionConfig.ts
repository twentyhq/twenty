import { DEFAULT_SINGLE_RECORD_ACTIONS_CONFIG_V1 } from '@/action-menu/actions/record-actions/single-record/constants/DefaultSingleRecordActionsConfigV1';
import { DEFAULT_SINGLE_RECORD_ACTIONS_CONFIG_V2 } from '@/action-menu/actions/record-actions/single-record/constants/DefaultSingleRecordActionsConfigV2';
import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { WORKFLOW_VERSIONS_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/constants/WorkflowVersionsSingleRecordActionsConfig';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getActionConfig = (
  objectMetadataItem: ObjectMetadataItem,
  isPageHeaderV2Enabled: boolean,
) => {
  if (objectMetadataItem.nameSingular === CoreObjectNameSingular.Workflow) {
    return WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG;
  }
  if (
    objectMetadataItem.nameSingular === CoreObjectNameSingular.WorkflowVersion
  ) {
    return WORKFLOW_VERSIONS_SINGLE_RECORD_ACTIONS_CONFIG;
  }
  return isPageHeaderV2Enabled
    ? DEFAULT_SINGLE_RECORD_ACTIONS_CONFIG_V2
    : DEFAULT_SINGLE_RECORD_ACTIONS_CONFIG_V1;
};
