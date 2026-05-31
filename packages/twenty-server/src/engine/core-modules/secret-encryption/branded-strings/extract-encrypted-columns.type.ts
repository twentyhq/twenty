import { type ContainsEncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/contains-encrypted-string.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';

type ExtractEncryptedColumnsFromShape<T> = NonNullable<
  {
    [P in keyof T]-?: true extends ContainsEncryptedString<NonNullable<T[P]>>
      ? P
      : never;
  }[keyof T]
>;

// Strip many-to-one and one-to-many relation properties up front so the
// structural recursion in `ContainsEncryptedString` cannot cross over
// into related entities and falsely flag a relation as
// encryption-bearing. Mirrors the relation-omission strategy used in
// `UniversalFlatEntityFrom`.
export type ExtractEncryptedColumns<T> = ExtractEncryptedColumnsFromShape<
  Omit<T, ExtractEntityRelatedEntityProperties<T>>
>;
