import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKey';
import { RecordAgnosticActionsKey } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKey';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useCheckIsSoftDeleteFilter } from '@/object-record/record-filter/hooks/useCheckIsSoftDeleteFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useShouldActionBeRegisteredByKey = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const { checkIsSoftDeleteFilter } = useCheckIsSoftDeleteFilter();

  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  if (!currentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    currentViewId,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const isDeletedFilterActive = currentRecordFilters.some(
    checkIsSoftDeleteFilter,
  );

  const isWorkflowsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const shouldBeRegisteredByKey = (key: string) => {
    switch (key) {
      case NoSelectionRecordActionKeys.CREATE_NEW_RECORD:
        return !hasObjectReadOnlyPermission;
      case NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS:
        return isDeletedFilterActive;
      case NoSelectionRecordActionKeys.SEE_DELETED_RECORDS:
        return !isDeletedFilterActive;
      case NoSelectionRecordActionKeys.GO_TO_RUNS:
      case NoSelectionRecordActionKeys.GO_TO_WORKFLOWS:
        return isWorkflowsEnabled;
      case NoSelectionRecordActionKeys.IMPORT_RECORDS:
      case NoSelectionRecordActionKeys.GO_TO_COMPANIES:
      case NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES:
      case NoSelectionRecordActionKeys.GO_TO_PEOPLE:
      case NoSelectionRecordActionKeys.GO_TO_SETTINGS:
      case NoSelectionRecordActionKeys.GO_TO_TASKS:
      case RecordAgnosticActionsKey.SEARCH_RECORDS:
      case RecordAgnosticActionsKey.SEARCH_RECORDS_FALLBACK:
        return true;
      default:
        return false;
    }
  };

  return {
    shouldBeRegisteredByKey,
  };
};
