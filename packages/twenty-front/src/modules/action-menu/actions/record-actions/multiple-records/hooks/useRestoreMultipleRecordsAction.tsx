import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared';

import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { BACKEND_BATCH_REQUEST_MAX_COUNT } from '@/object-record/constants/BackendBatchRequestMaxCount';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useCheckIsSoftDeleteFilter } from '@/object-record/record-filter/hooks/useCheckIsSoftDeleteFilter';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useRestoreMultipleRecordsAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const [isRestoreRecordsModalOpen, setIsRestoreRecordsModalOpen] =
      useState(false);

    const contextStoreCurrentViewId = useRecoilComponentValueV2(
      contextStoreCurrentViewIdComponentState,
    );

    if (!contextStoreCurrentViewId) {
      throw new Error('Current view ID is not defined');
    }

    const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

    const { resetTableRowSelection } = useRecordTable({
      recordTableId: getRecordIndexIdFromObjectNamePluralAndViewId(
        objectMetadataItem.namePlural,
        contextStoreCurrentViewId,
      ),
    });

    const { restoreManyRecords } = useRestoreManyRecords({
      objectNameSingular: objectMetadataItem.nameSingular,
    });

    const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
      contextStoreNumberOfSelectedRecordsComponentState,
    );

    const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
      contextStoreTargetedRecordsRuleComponentState,
    );

    const contextStoreFilters = useRecoilComponentValueV2(
      contextStoreFiltersComponentState,
    );

    const { filterValueDependencies } = useFilterValueDependencies();

    const deletedAtFilter: RecordGqlOperationFilter = {
      deletedAt: { is: 'NOT_NULL' },
    };

    const graphqlFilter = {
      ...computeContextStoreFilters(
        contextStoreTargetedRecordsRule,
        contextStoreFilters,
        objectMetadataItem,
        filterValueDependencies,
      ),
      ...deletedAtFilter,
    };

    const { checkIsSoftDeleteFilter } = useCheckIsSoftDeleteFilter();

    const isDeletedFilterActive = contextStoreFilters.some(
      checkIsSoftDeleteFilter,
    );

    const { fetchAllRecords: fetchAllRecordIds } = useLazyFetchAllRecords({
      objectNameSingular: objectMetadataItem.nameSingular,
      filter: graphqlFilter,
      limit: DEFAULT_QUERY_PAGE_SIZE,
      recordGqlFields: { id: true },
    });

    const handleRestoreClick = useCallback(async () => {
      const recordsToRestore = await fetchAllRecordIds();
      const recordIdsToRestore = recordsToRestore.map((record) => record.id);

      resetTableRowSelection();

      await restoreManyRecords({
        idsToRestore: recordIdsToRestore,
      });
    }, [restoreManyRecords, fetchAllRecordIds, resetTableRowSelection]);

    const isRemoteObject = objectMetadataItem.isRemote;

    const shouldBeRegistered =
      !hasObjectReadOnlyPermission &&
      !isRemoteObject &&
      isDeletedFilterActive &&
      isDefined(contextStoreNumberOfSelectedRecords) &&
      contextStoreNumberOfSelectedRecords < BACKEND_BATCH_REQUEST_MAX_COUNT &&
      contextStoreNumberOfSelectedRecords > 0;

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      setIsRestoreRecordsModalOpen(true);
    };

    const confirmationModal = (
      <ConfirmationModal
        isOpen={isRestoreRecordsModalOpen}
        setIsOpen={setIsRestoreRecordsModalOpen}
        title={'Restore Records'}
        subtitle={`Are you sure you want to restore these records?`}
        onConfirmClick={handleRestoreClick}
        confirmButtonText={'Restore Records'}
      />
    );

    return {
      shouldBeRegistered,
      onClick,
      ConfirmationModal: confirmationModal,
    };
  };
