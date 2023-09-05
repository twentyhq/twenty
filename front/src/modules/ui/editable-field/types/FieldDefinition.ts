import { IconComponent } from '@/ui/icon/types/IconComponent';

import { FieldMetadata, FieldType } from './FieldMetadata';

export type FieldDefinition<T extends FieldMetadata | unknown> = {
  id: string;
  label: string;
  Icon?: IconComponent;
  type: FieldType;
  metadata: T;
};
