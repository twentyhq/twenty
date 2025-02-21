import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';

import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { BACKEND_BATCH_REQUEST_MAX_COUNT } from '@/object-record/constants/BackendBatchRequestMaxCount';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { useDestroyManyRecords } from '@/object-record/hooks/useDestroyManyRecords';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared';

export const useDestroyMultipleRecordsAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const [isDestroyRecordsModalOpen, setIsDestroyRecordsModalOpen] =
      useState(false);

    const { resetTableRowSelection } = useRecordTable({
      recordTableId: objectMetadataItem.namePlural,
    });

    const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

    const { destroyManyRecords } = useDestroyManyRecords({
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

    const deletedAtFieldMetadata = objectMetadataItem.fields.find(
      (field) => field.name === 'deletedAt',
    );

    const isDeletedFilterActive = contextStoreFilters.some(
      (filter) =>
        filter.fieldMetadataId === deletedAtFieldMetadata?.id &&
        filter.operand === RecordFilterOperand.IsNotEmpty,
    );

    const { fetchAllRecords: fetchAllRecordIds } = useLazyFetchAllRecords({
      objectNameSingular: objectMetadataItem.nameSingular,
      filter: graphqlFilter,
      limit: DEFAULT_QUERY_PAGE_SIZE,
      recordGqlFields: { id: true },
    });

    const handleDestroyClick = useCallback(async () => {
      const recordsToDestroy = await fetchAllRecordIds();
      const recordIdsToDestroy = recordsToDestroy.map((record) => record.id);

      resetTableRowSelection();

      await destroyManyRecords({ recordIdsToDestroy });
    }, [destroyManyRecords, fetchAllRecordIds, resetTableRowSelection]);

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

      setIsDestroyRecordsModalOpen(true);
    };

    const confirmationModal = (
      <ConfirmationModal
        isOpen={isDestroyRecordsModalOpen}
        setIsOpen={setIsDestroyRecordsModalOpen}
        title={'Permanently Destroy Records'}
        subtitle={
          "Are you sure you want to destroy these records? They won't be recoverable anymore."
        }
        onConfirmClick={handleDestroyClick}
        deleteButtonText={'Destroy Records'}
      />
    );

    return {
      shouldBeRegistered,
      onClick,
      ConfirmationModal: confirmationModal,
    };
  };
