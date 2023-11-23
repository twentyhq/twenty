import { SortDirection } from './SortDirection';

export type SortDefinition = {
  fieldMetadataId: string;
  label: string;
  iconName: string;
  getOrderByTemplate?: (direction: SortDirection) => any[];
};
