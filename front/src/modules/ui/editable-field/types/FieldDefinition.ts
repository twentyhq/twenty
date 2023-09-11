import { IconComponent } from '@/ui/icon/types/IconComponent';

import { FieldMetadata, FieldType } from './FieldMetadata';

export type FieldDefinition<T extends FieldMetadata | unknown> = {
  key: string;
  name: string;
  Icon?: IconComponent;
  type: FieldType;
  metadata: T;
};
