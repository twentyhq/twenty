import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useShouldActionBeRegisteredParams = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
}) => {
  const { sortedFavorites: favorites } = useFavorites();

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const recordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const foundFavorite = favorites?.find(
    (favorite) => favorite.recordId === recordId,
  );

  const isFavorite = !!foundFavorite;

  const selectedRecord =
    useRecoilValue(recordStoreFamilyState(recordId ?? '')) || undefined;

  const isRemoteObject = objectMetadataItem?.isRemote;

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const isNoteOrTask =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Task;

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const isSoftDeleteFilterActive = useRecoilComponentValueV2(
    isSoftDeleteFilterActiveComponentState,
  );

  const isShowPage =
    useRecoilComponentValueV2(contextStoreCurrentViewTypeComponentState) ===
    ContextStoreViewType.ShowPage;

  const isWorkflowsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const numberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId,
    objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Workflow,
  );

  return {
    isFavorite,
    isRemoteObject,
    hasObjectReadOnlyPermission,
    isNoteOrTask,
    isInRightDrawer,
    isSoftDeleteFilterActive,
    isShowPage,
    selectedRecord,
    isWorkflowsEnabled,
    numberOfSelectedRecords,
    workflowWithCurrentVersion,
  };
};
