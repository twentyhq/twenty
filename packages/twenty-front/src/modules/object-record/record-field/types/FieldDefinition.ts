import { FieldMetadataType } from '~/generated-metadata/graphql';

import { IconComponent } from 'twenty-ui/display';
import { FieldMetadata } from './FieldMetadata';

export type FieldDefinition<T extends FieldMetadata> = {
  fieldMetadataId: string;
  label: string;
  showLabel?: boolean;
  disableTooltip?: boolean;
  labelWidth?: number;
  iconName: string;
  type: FieldMetadataType;
  metadata: T;
  infoTooltipContent?: string;
  defaultValue?: any;
  editButtonIcon?: IconComponent;
};
