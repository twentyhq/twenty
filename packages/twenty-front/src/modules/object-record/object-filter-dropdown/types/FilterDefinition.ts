import { IconComponent } from 'twenty-ui';

import { FilterType } from './FilterType';

export type FilterDefinition = {
  fieldMetadataId: string;
  label: string;
  iconName: string;
  type: FilterType;
  relationObjectMetadataNamePlural?: string;
  relationObjectMetadataNameSingular?: string;
  selectAllLabel?: string;
  SelectAllIcon?: IconComponent;
};
