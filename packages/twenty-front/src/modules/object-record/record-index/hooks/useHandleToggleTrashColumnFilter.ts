import { useCallback } from 'react';
import { v4 } from 'uuid';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useRecoilCallback } from 'recoil';
import { isDefined } from '~/utils/isDefined';

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

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters(viewBarId);
  const { isSoftDeleteActiveState } = useRecordTableStates(viewBarId);

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

    const newFilter: Filter = {
      id: v4(),
      variant: 'danger',
      fieldMetadataId: trashFieldMetadata.id,
      operand: ViewFilterOperand.IsNotEmpty,
      displayValue: '',
      definition: {
        label: `Deleted`,
        iconName: 'IconTrash',
        fieldMetadataId: trashFieldMetadata.id,
        type: filterType,
      },
      value: '',
    };

    upsertCombinedViewFilter(newFilter);
  }, [columnDefinitions, objectMetadataItem, upsertCombinedViewFilter]);

  const toggleSoftDeleteFilterState = useRecoilCallback(
    ({ set }) =>
      (currentState: boolean) => {
        set(isSoftDeleteActiveState, currentState);
      },
    [isSoftDeleteActiveState],
  );
  return {
    handleToggleTrashColumnFilter,
    toggleSoftDeleteFilterState,
  };
};
