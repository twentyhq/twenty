import {
  type FieldManifest,
  type ObjectFieldManifest,
} from 'twenty-shared/application';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type MessageDescriptor } from '@/app/translations/message';

export type TranslatableOptionLabel = string | MessageDescriptor;

export type WithTranslatableOptionLabels<TEntity> = TEntity extends {
  options?: (infer TOption)[];
}
  ? Omit<TEntity, 'options'> & {
      options?: (Omit<TOption, 'label'> & {
        label: TranslatableOptionLabel;
      })[];
    }
  : TEntity;

// Only select options are displayed through their label
export type WithTranslatableFieldOptionLabels<TField> = TField extends {
  type: FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT;
}
  ? WithTranslatableOptionLabels<TField>
  : TField;

export type TranslatableFieldManifest =
  WithTranslatableFieldOptionLabels<FieldManifest>;

export type TranslatableObjectFieldManifest =
  WithTranslatableFieldOptionLabels<ObjectFieldManifest>;
