import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';

export type ApplicationVariableUserValueMaps = {
  byApplicationVariableId: Partial<
    Record<string, Partial<Record<string, EncryptedString>>>
  >;
};
