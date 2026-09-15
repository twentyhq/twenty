import { type Manifest } from 'twenty-shared/application';
import {
  FieldMetadataType,
  type RelationAndMorphRelationFieldMetadataType,
} from 'twenty-shared/types';

export const MINIMUM_UNIVERSAL_IDENTIFIER_UUID_VERSION = 4;

const RELATION_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
];

export type ManifestField =
  | Manifest['fields'][number]
  | Manifest['objects'][number]['fields'][number];

type RelationManifestField = Extract<
  ManifestField,
  { type: RelationAndMorphRelationFieldMetadataType }
>;

export const isRelationFieldManifest = (
  field: ManifestField,
): field is RelationManifestField => RELATION_FIELD_TYPES.includes(field.type);

export const getDuplicateValues = (values: string[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }

  return Array.from(duplicates);
};
