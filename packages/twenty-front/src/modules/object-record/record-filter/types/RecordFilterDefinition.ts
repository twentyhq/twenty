import { FilterableFieldType } from './FilterableFieldType';

export type RecordFilterDefinition = {
  fieldMetadataId: string;
  label: string;
  iconName: string;
  type: FilterableFieldType;
  compositeFieldName?: string;
};
