import type { ExportObjectItem } from '../types/exportObjectItem';

export const filterItems = (items: ExportObjectItem[], searchTerm: string) =>
  items.filter(
    (item) =>
      item.labelPlural.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.objectTypeLabelText.toLowerCase().includes(searchTerm.toLowerCase()),
  );
