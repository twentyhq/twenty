import { type HasEncryptedStringBrand } from 'src/engine/core-modules/secret-encryption/branded-strings/has-encrypted-string-brand.type';

export type HasEncryptedStringBrandInUnion<T> = T extends unknown
  ? HasEncryptedStringBrand<T>
  : never;
