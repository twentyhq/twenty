import { type Equal, type Expect } from 'twenty-shared/testing';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type ExtractEncryptedColumns } from 'src/engine/core-modules/secret-encryption/branded-strings/extract-encrypted-columns.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

// oxlint-disable-next-line @typescripttypescript/no-empty-object-type
type EmptyObject = {};

type TestedRecord = {
  // Non-EncryptedString fields - must NOT be extracted
  plainString: string;
  plainStringNullable: string | null;
  plainNumber: number;
  plainBoolean: boolean;
  plainObject: EmptyObject;
  plainArray: string[];
  plainUnknown: unknown;
  plaintextBranded: PlaintextString;
  plaintextBrandedNullable: PlaintextString | null;
  emptyStringLiteral: '';
  encVersionedLiteral: 'enc:v2:xxx';

  // EncryptedString fields - MUST be extracted
  encryptedRequired: EncryptedString;
  encryptedNullable: EncryptedString | null;
  encryptedUndefinable: EncryptedString | undefined;
  encryptedOptional?: EncryptedString;
  encryptedOrEmpty: EncryptedString | '';
  encryptedUnionWithPrimitive: EncryptedString | string;
  encryptedUnionWithPlaintext: EncryptedString | PlaintextString;
};

type TestResult = ExtractEncryptedColumns<TestedRecord>;

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      TestResult,
      | 'encryptedRequired'
      | 'encryptedNullable'
      | 'encryptedUndefinable'
      | 'encryptedOptional'
      | 'encryptedOrEmpty'
      | 'encryptedUnionWithPrimitive'
      | 'encryptedUnionWithPlaintext'
    >
  >,

  // Empty object returns never
  Expect<Equal<ExtractEncryptedColumns<EmptyObject>, never>>,

  // Object with no EncryptedString fields returns never
  Expect<
    Equal<ExtractEncryptedColumns<{ a: string; b: number; c: '' }>, never>
  >,

  // Object with only PlaintextString fields returns never (brands don't cross)
  Expect<
    Equal<
      ExtractEncryptedColumns<{
        a: PlaintextString;
        b: PlaintextString | null;
      }>,
      never
    >
  >,
];
