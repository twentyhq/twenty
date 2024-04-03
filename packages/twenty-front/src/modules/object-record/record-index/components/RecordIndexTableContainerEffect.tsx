import { useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { getOperandsForFilterType } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { useRecordActionBar } from '@/object-record/record-action-bar/hooks/useRecordActionBar';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useDropdownRemotely } from '@/ui/layout/dropdown/hooks/useDropdownRemotely';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { useSetRecordCountInCurrentView } from '@/views/hooks/useSetRecordCountInCurrentView';
import { isDefined } from '~/utils/isDefined';

type RecordIndexTableContainerEffectProps = {
  objectNameSingular: string;
  recordTableId: string;
  viewBarId: string;
};

export const RecordIndexTableContainerEffect = ({
  objectNameSingular,
  recordTableId,
  viewBarId,
}: RecordIndexTableContainerEffectProps) => {
  const {
    setAvailableTableColumns,
    setOnEntityCountChange,
    resetTableRowSelection,
    selectedRowIdsSelector,
    setOnToggleColumnFilter,
  } = useRecordTable({
    recordTableId,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const { setRecordCountInCurrentView } =
    useSetRecordCountInCurrentView(viewBarId);

  useEffect(() => {
    setAvailableTableColumns(columnDefinitions);
  }, [columnDefinitions, setAvailableTableColumns]);

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector());

  const { setActionBarEntries, setContextMenuEntries } = useRecordActionBar({
    objectMetadataItem,
    selectedRecordIds: selectedRowIds,
    callback: resetTableRowSelection,
  });

  // TODO: import relevant stuff from view here :
  const { upsertCombinedViewFilter } = useCombinedViewFilters(viewBarId);
  const { openDropdownRemotely } = useDropdownRemotely();

  const handleToggleColumnFilter = useCallback(
    (fieldMetadataId: string) => {
      const correspondingColumnDefinition = columnDefinitions.find(
        (columnDefinition) =>
          columnDefinition.fieldMetadataId === fieldMetadataId,
      );

      if (!isDefined(correspondingColumnDefinition)) return;

      const filterType = getFilterTypeFromFieldType(
        correspondingColumnDefinition?.type,
      );

      const availableOperandsForFilter = getOperandsForFilterType(filterType);

      const defaultOperand = availableOperandsForFilter[0];

      const newFilter: Filter = {
        fieldMetadataId,
        operand: defaultOperand,
        displayValue: '',
        definition: {
          label: correspondingColumnDefinition.label,
          iconName: correspondingColumnDefinition.iconName,
          fieldMetadataId,
          type: filterType,
        },
        value: '',
      };

      upsertCombinedViewFilter(newFilter);

      openDropdownRemotely(fieldMetadataId, {
        scope: fieldMetadataId,
      });
    },
    [columnDefinitions, upsertCombinedViewFilter, openDropdownRemotely],
  );

  useEffect(() => {
    setOnToggleColumnFilter(
      () => (fieldMetadataId: string) =>
        handleToggleColumnFilter(fieldMetadataId),
    );
  }, [setOnToggleColumnFilter, handleToggleColumnFilter]);

  useEffect(() => {
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [setActionBarEntries, setContextMenuEntries]);

  useEffect(() => {
    setOnEntityCountChange(
      () => (entityCount: number) => setRecordCountInCurrentView(entityCount),
    );
  }, [setRecordCountInCurrentView, setOnEntityCountChange]);

  return <></>;
};
