import { useCallback } from 'react';
import { v4 } from 'uuid';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

import { useRecoilCallback } from 'recoil';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';
import { isDefined } from 'twenty-shared/utils';

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
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const isSoftDeleteFilterActiveComponentRecoilState =
    useRecoilComponentCallbackState(
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
      operand: ViewFilterOperand.IsNotEmpty,
      displayValue: '',
      type: filterType,
      label: `Deleted`,
      value: '',
    };

    upsertRecordFilter(newFilter);
  }, [columnDefinitions, objectMetadataItem, upsertRecordFilter]);

  const toggleSoftDeleteFilterState = useRecoilCallback(
    ({ set }) =>
      (currentState: boolean) => {
        set(isSoftDeleteFilterActiveComponentRecoilState, currentState);
      },
    [isSoftDeleteFilterActiveComponentRecoilState],
  );
  return {
    handleToggleTrashColumnFilter,
    toggleSoftDeleteFilterState,
  };
};
