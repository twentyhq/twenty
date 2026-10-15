import {
  type FieldManifest,
  type ObjectFieldManifest,
} from 'twenty-shared/application';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type MessageDescriptor } from '@/sdk/front-component/translations/message';

export type TranslatableText = string | MessageDescriptor;

export type WithTranslatableProperties<
  TEntity,
  TProperty extends PropertyKey,
> = {
  [TKey in keyof TEntity]: TKey extends TProperty
    ? TEntity[TKey] | MessageDescriptor
    : TEntity[TKey];
};

export type WithTranslatableOptionLabels<TEntity> = TEntity extends {
  options?: (infer TOption)[];
}
  ? Omit<TEntity, 'options'> & {
      options?: (Omit<TOption, 'label'> & {
        label: TranslatableText;
      })[];
    }
  : TEntity;

export type WithTranslatableFieldOptionLabels<TField> = TField extends {
  type: FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT;
}
  ? WithTranslatableOptionLabels<TField>
  : TField;

export type WithSerializedMessages<TValue> = TValue extends
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  ? TValue
  : TValue extends MessageDescriptor
    ? string
    : TValue extends
          | ((...args: never[]) => unknown)
          | (abstract new (...args: never[]) => unknown)
      ? TValue
      : TValue extends (infer TItem)[]
        ? WithSerializedMessages<TItem>[]
        : TValue extends object
          ? { [TKey in keyof TValue]: WithSerializedMessages<TValue[TKey]> }
          : TValue;

export type TranslatableFieldManifest =
  WithTranslatableFieldOptionLabels<FieldManifest>;

export type TranslatableObjectFieldManifest =
  WithTranslatableFieldOptionLabels<ObjectFieldManifest>;
