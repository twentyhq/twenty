import { type Equal, type Expect } from 'twenty-shared/testing';
import { type EmptyObject } from 'twenty-shared/types';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type ExtractEncryptedColumns } from 'src/engine/core-modules/secret-encryption/branded-strings/extract-encrypted-columns.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

type EncryptedConnectionParametersLike = {
  IMAP?: { host: string; password: EncryptedString };
  SMTP?: { host: string; password: EncryptedString };
};

type DeeplyNestedThreeLevels = {
  level1: {
    level2: {
      level3: EncryptedString;
    };
  };
};

class FakeRelatedEntity extends WorkspaceRelatedEntity {
  fakeId: string;
  encryptedTokenOnRelatedEntity: EncryptedString | null;
}

type TestedRecord = {
  // Non-EncryptedString fields - must NOT be extracted
  plainString: string;
  plainStringNullable: string | null;
  plainNumber: number;
  plainBoolean: boolean;
  plainDate: Date;
  plainObject: EmptyObject;
  plainArray: string[];
  plainUnknown: unknown;
  plaintextBranded: PlaintextString;
  plaintextBrandedNullable: PlaintextString | null;
  emptyStringLiteral: '';
  encVersionedLiteral: 'enc:v2:xxx';
  recordWithoutEncryption: { host: string; port: number };
  arrayOfPlaintextRecords: Array<{ host: string }>;

  // Direct EncryptedString fields - MUST be extracted
  encryptedRequired: EncryptedString;
  encryptedNullable: EncryptedString | null;
  encryptedUndefinable: EncryptedString | undefined;
  encryptedOptional?: EncryptedString;
  encryptedOrEmpty: EncryptedString | '';
  encryptedUnionWithPrimitive: EncryptedString | string;
  encryptedUnionWithPlaintext: EncryptedString | PlaintextString;

  // Nested EncryptedString — MUST be extracted (transitive structural)
  connectionParametersLike: EncryptedConnectionParametersLike;
  connectionParametersLikeNullable: EncryptedConnectionParametersLike | null;
  arrayOfRecordsWithEncrypted: Array<{ secret: EncryptedString }>;
  recordWithEncryptedAtTopLevel: { secret: EncryptedString };
  deeplyNested: DeeplyNestedThreeLevels;

  // Entity relations — MUST NOT be extracted, even though the related
  // entity carries an EncryptedString column. Stripped by
  // `ExtractEntityRelatedEntityProperties` before recursion.
  relatedEntity: FakeRelatedEntity;
  relatedEntityNullable: FakeRelatedEntity | null;
  relatedEntityArray: FakeRelatedEntity[];
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
      | 'connectionParametersLike'
      | 'connectionParametersLikeNullable'
      | 'arrayOfRecordsWithEncrypted'
      | 'recordWithEncryptedAtTopLevel'
      | 'deeplyNested'
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
