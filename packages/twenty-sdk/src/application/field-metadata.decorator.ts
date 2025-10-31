import { type SyncableEntityOptions } from '@/application/syncable-entity-options.type';

import {
  type FieldMetadataType,
  type FieldMetadataSettings,
  type FieldMetadataOptions,
  type FieldMetadataDefaultValue,
} from 'twenty-shared/types';

type FieldOptions<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    // Use @WorkspaceRelation or @WorkspaceDynamicRelation for relation fields
    FieldMetadataType.RELATION
  >,
> = SyncableEntityOptions & {
  type: T;
  label: string;
  description?: string;
  icon?: string;
  defaultValue?: FieldMetadataDefaultValue<T>;
  options?: FieldMetadataOptions<T>;
  settings?: FieldMetadataSettings<T>;
  isNullable?: boolean;
};

export const FieldMetadata = <T extends FieldMetadataType>(
  _: FieldOptions<T>,
): PropertyDecorator => {
  return () => {};
};
