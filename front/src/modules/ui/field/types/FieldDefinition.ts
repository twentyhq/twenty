import { IconComponent } from '@/ui/icon/types/IconComponent';

import { FieldMetadata } from './FieldMetadata';
import { FieldType } from './FieldType';

export type FieldDefinition<T extends FieldMetadata> = {
  key: string;
  name: string;
  Icon?: IconComponent;
  type: FieldType;
  metadata: T;
  basePathToShowPage?: string;
  infoTooltipContent?: string;
};
