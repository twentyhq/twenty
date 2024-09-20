import { SelectableRecord } from '@/object-record/select/types/SelectableRecord';

export const getSourceEnumOptions = (
  selectedRecordIds: string[],
): SelectableRecord[] => {
  return [
    {
      id: 'MANUAL',
      name: 'MANUAL',
      record: null,
      isSelected: selectedRecordIds.includes('MANUAL'),
    },
    {
      id: 'IMPORT',
      name: 'IMPORT',
      record: null,
      isSelected: selectedRecordIds.includes('IMPORT'),
    },
    {
      id: 'API',
      name: 'API',
      record: null,
      isSelected: selectedRecordIds.includes('API'),
    },
    {
      id: 'EMAIL',
      name: 'EMAIL',
      record: null,
      isSelected: selectedRecordIds.includes('EMAIL'),
    },
    {
      id: 'CALENDAR',
      name: 'CALENDAR',
      record: null,
      isSelected: selectedRecordIds.includes('CALENDAR'),
    },
  ];
};
