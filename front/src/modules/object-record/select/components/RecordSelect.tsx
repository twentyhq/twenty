import { useState } from 'react';

import { MultipleRecordSelect } from '@/object-record/select/components/MultipleRecordSelect';
import { useRecordSearchQuery } from '@/object-record/select/hooks/useRecordSearchQuery';
import { RecordToSelect } from '@/object-record/select/types/RecordToSelect';

export const RecordSelect = ({
  onCancel,
  onSubmit,
  objectNameSingular,
  isMultiSelect,
}: {
  onCancel: (selectedRecords: RecordToSelect[]) => void;
  onSubmit: (selectedRecords: RecordToSelect[]) => void;
  objectNameSingular: string;
  isMultiSelect: boolean;
}) => {
  const [searchFilterText, setSearchFilterText] = useState('');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { loading, filteredSelectedRecords, recordsToSelect, selectedRecords } =
    useRecordSearchQuery({
      searchFilterText,
      selectedIds: selectedIds,
      objectNameSingular,
      limit: 10,
    });

  const handleMultipleRecordSelectChange = (
    recordToSelect: RecordToSelect,
    newSelectedValue: boolean,
  ) => {
    setSelectedIds((prevSelectedIds) => {
      if (newSelectedValue) {
        return [...prevSelectedIds, recordToSelect.id];
      }

      return prevSelectedIds.filter((id) => id !== recordToSelect.id);
    });
  };

  const handleCancel = () => {
    onCancel(recordsToSelect.filter((record) => record.isSelected));
  };

  const handleSubmit = () => {
    onSubmit(recordsToSelect.filter((record) => record.isSelected));
  };

  return isMultiSelect ? (
    <MultipleRecordSelect
      recordsToSelect={recordsToSelect}
      filteredSelectedRecords={filteredSelectedRecords}
      selectedRecords={selectedRecords}
      onChange={handleMultipleRecordSelectChange}
      onSearchFilterChange={setSearchFilterText}
      searchFilter={searchFilterText}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  ) : null;
};
