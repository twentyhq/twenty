import { useCallback } from 'react';
import { v4 } from 'uuid';

import { useColumnDefinitionsFromObjectMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromObjectMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { t } from '@lingui/core/macro';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

import { useStore } from 'jotai';
import { ViewFilterOperand } from 'twenty-shared/types';

type UseHandleToggleTrashColumnFilterProps = {
  objectNameSingular: string;
  viewBarId: string;
};

export const useHandleToggleTrashColumnFilter = ({
  viewBarId,
  objectNameSingular,
}: UseHandleToggleTrashColumnFilterProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromObjectMetadata(objectMetadataItem);

  const isSoftDeleteFilterActiveComponentRecoilState =
    useRecoilComponentStateCallbackStateV2(
      isSoftDeleteFilterActiveComponentState,
      viewBarId,
    );

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const handleToggleTrashColumnFilter = useCallback(() => {
    const trashFieldMetadata = objectMetadataItem.fields.find(
      (field: { name: string }) => field.name === 'deletedAt',
    );

    if (!isDefined(trashFieldMetadata)) return;

    const correspondingColumnDefinition = columnDefinitions.find(
      (columnDefinition) =>
        columnDefinition.fieldMetadataId === trashFieldMetadata.id,
    );

    if (!isDefined(correspondingColumnDefinition)) return;

    const filterType = getFilterTypeFromFieldType(
      correspondingColumnDefinition?.type,
    );

    const newFilter: RecordFilter = {
      id: v4(),
      fieldMetadataId: trashFieldMetadata.id,
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      displayValue: '',
      type: filterType,
      label: t`Deleted`,
      value: '',
    };

    upsertRecordFilter(newFilter);
  }, [columnDefinitions, objectMetadataItem, upsertRecordFilter]);

  const store = useStore();

  const toggleSoftDeleteFilterState = useCallback(
    (currentState: boolean) => {
      store.set(isSoftDeleteFilterActiveComponentRecoilState, currentState);
    },
    [isSoftDeleteFilterActiveComponentRecoilState, store],
  );
  return {
    handleToggleTrashColumnFilter,
    toggleSoftDeleteFilterState,
  };
};
