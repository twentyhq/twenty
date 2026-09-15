import { type Equal, type Expect } from 'twenty-shared/testing';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

// This file contains compile-time-only assertions: if the brand contract
// is violated, `tsc` fails. There are no runtime expectations. The unused
// type aliases below intentionally exist solely to surface `Expect<...>`
// failures.

// Raw `string` is NOT assignable to either brand (the structural anchor
// of the hard brand). A failure here means the brand became soft.
type RawStringIsNotAssignableToEncrypted = Expect<
  Equal<string extends EncryptedString ? true : false, false>
>;

type RawStringIsNotAssignableToPlaintext = Expect<
  Equal<string extends PlaintextString ? true : false, false>
>;

// Both brands erase to `string` for read-only consumers (logging, DB
// writes, GraphQL responses). A failure here means the brand became a
// disjoint type and would force unnecessary coercion across the codebase.
type EncryptedErasesToString = Expect<
  Equal<EncryptedString extends string ? true : false, true>
>;

type PlaintextErasesToString = Expect<
  Equal<PlaintextString extends string ? true : false, true>
>;

// The two brands are not interchangeable: passing ciphertext where
// plaintext is expected (or vice versa) must be a type error. This is
// the core invariant guarding against the #20819 class of bug.
type EncryptedIsNotAssignableToPlaintext = Expect<
  Equal<EncryptedString extends PlaintextString ? true : false, false>
>;

type PlaintextIsNotAssignableToEncrypted = Expect<
  Equal<PlaintextString extends EncryptedString ? true : false, false>
>;

// oxlint-disable-next-line unused-imports/no-unused-vars
type BrandInvariants = [
  RawStringIsNotAssignableToEncrypted,
  RawStringIsNotAssignableToPlaintext,
  EncryptedErasesToString,
  PlaintextErasesToString,
  EncryptedIsNotAssignableToPlaintext,
  PlaintextIsNotAssignableToEncrypted,
];
