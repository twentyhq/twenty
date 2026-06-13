import { type FieldMetadataType } from '~/generated-metadata/graphql';

import { type IconComponent } from 'twenty-ui-deprecated/display';
import { type FieldMetadata } from './FieldMetadata';

export type FieldDefinition<T extends FieldMetadata> = {
  fieldMetadataId: string;
  label: string;
  showLabel?: boolean;
  labelWidth?: number;
  iconName: string;
  type: FieldMetadataType;
  metadata: T;
  defaultValue?: any;
  editButtonIcon?: IconComponent;
  isUIEditable?: boolean;
};
