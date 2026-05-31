import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';

export type HasEncryptedStringBrand<T> = T extends EncryptedString
  ? true
  : false;
