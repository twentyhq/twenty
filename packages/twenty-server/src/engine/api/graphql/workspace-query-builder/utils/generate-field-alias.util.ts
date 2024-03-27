import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

export const generateFieldAlias = (
  fieldMetadata: FieldMetadataInterface,
): string => {
  /**
   * TODO: Implemente here logic for standard field of plugin
   * format should be: [PluginName]_fieldName
   */
  return fieldMetadata.name;
};
