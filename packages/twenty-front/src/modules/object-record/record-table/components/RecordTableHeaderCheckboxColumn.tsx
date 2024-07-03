import { SelectAllCheckbox } from '@/object-record/record-table/components/SelectAllCheckbox';

export const RecordTableHeaderCheckboxColumn = () => {
  return (
    <th
      style={{
        width: 30,
        minWidth: 30,
        maxWidth: 30,
        borderRight: 'transparent',
      }}
    >
      <SelectAllCheckbox />
    </th>
  );
};
