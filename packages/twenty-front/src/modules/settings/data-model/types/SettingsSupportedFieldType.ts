import { FieldMetadataType } from '~/generated-metadata/graphql';

export type SettingsSupportedFieldType = Exclude<
  FieldMetadataType,
  FieldMetadataType.Position | FieldMetadataType.RawJson
>;
