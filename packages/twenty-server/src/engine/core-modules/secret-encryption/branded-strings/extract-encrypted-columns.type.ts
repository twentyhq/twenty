import { type HasEncryptedStringBrandInUnion } from 'src/engine/core-modules/secret-encryption/branded-strings/has-encrypted-string-brand-in-union.type';

export type ExtractEncryptedColumns<T> = NonNullable<
  {
    [P in keyof T]-?: true extends HasEncryptedStringBrandInUnion<
      NonNullable<T[P]>
    >
      ? P
      : never;
  }[keyof T]
>;
