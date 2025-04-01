import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';

import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';

export const useDeleteMultipleRecordsAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
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

    const { deleteManyRecords } = useDeleteManyRecords({
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

    const graphqlFilter = computeContextStoreFilters(
      contextStoreTargetedRecordsRule,
      contextStoreFilters,
      objectMetadataItem,
      filterValueDependencies,
    );

    const { fetchAllRecords: fetchAllRecordIds } = useLazyFetchAllRecords({
      objectNameSingular: objectMetadataItem.nameSingular,
      filter: graphqlFilter,
      limit: DEFAULT_QUERY_PAGE_SIZE,
      recordGqlFields: { id: true },
    });

    const handleDeleteClick = useCallback(async () => {
      const recordsToDelete = await fetchAllRecordIds();
      const recordIdsToDelete = recordsToDelete.map((record) => record.id);

      resetTableRowSelection();

      await deleteManyRecords({
        recordIdsToDelete,
      });
    }, [deleteManyRecords, fetchAllRecordIds, resetTableRowSelection]);

    const onClick = () => {
      setIsDeleteRecordsModalOpen(true);
    };

    const confirmationModal = (
      <ConfirmationModal
        isOpen={isDeleteRecordsModalOpen}
        setIsOpen={setIsDeleteRecordsModalOpen}
        title={'Delete Records'}
        subtitle={t`Are you sure you want to delete these records? They can be recovered from the Command menu.`}
        onConfirmClick={handleDeleteClick}
        confirmButtonText={'Delete Records'}
      />
    );

    return {
      onClick,
      ConfirmationModal: confirmationModal,
    };
  };
