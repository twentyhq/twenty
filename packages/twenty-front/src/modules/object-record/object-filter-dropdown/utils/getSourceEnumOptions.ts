import { SelectableItem } from '@/object-record/select/types/SelectableItem';

export const getSourceEnumOptions = (
  selectedItemIds: string[],
): SelectableItem[] => {
  return [
    {
      id: 'MANUAL',
      name: 'MANUAL',
      isSelected: selectedItemIds.includes('MANUAL'),
    },
    {
      id: 'IMPORT',
      name: 'IMPORT',
      isSelected: selectedItemIds.includes('IMPORT'),
    },
    {
      id: 'API',
      name: 'API',
      isSelected: selectedItemIds.includes('API'),
    },
    {
      id: 'EMAIL',
      name: 'EMAIL',
      isSelected: selectedItemIds.includes('EMAIL'),
    },
    {
      id: 'CALENDAR',
      name: 'CALENDAR',
      isSelected: selectedItemIds.includes('CALENDAR'),
    },
  ];
};
