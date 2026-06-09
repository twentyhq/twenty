import { type ContainsEncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/contains-encrypted-string.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';

type ExtractEncryptedColumnsFromShape<T> = NonNullable<
  {
    [P in keyof T]-?: true extends ContainsEncryptedString<NonNullable<T[P]>>
      ? P
      : never;
  }[keyof T]
>;

export type ExtractEncryptedColumns<T> = ExtractEncryptedColumnsFromShape<
  Omit<T, ExtractEntityRelatedEntityProperties<T>>
>;
