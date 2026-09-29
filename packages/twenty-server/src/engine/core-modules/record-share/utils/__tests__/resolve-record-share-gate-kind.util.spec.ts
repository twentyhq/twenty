/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';

import { resolveRecordShareGateKind } from 'src/engine/core-modules/record-share/utils/resolve-record-share-gate-kind.util';

describe('resolveRecordShareGateKind', () => {
  it.each([
    {
      readability: MetadataReadability.OPEN,
      isOwningApplication: false,
      expected: 'open',
    },
    {
      readability: MetadataReadability.OPEN,
      isOwningApplication: true,
      expected: 'open',
    },
    {
      readability: MetadataReadability.INHERITED,
      isOwningApplication: false,
      expected: 'inherited',
    },
    {
      readability: MetadataReadability.INHERITED,
      isOwningApplication: true,
      expected: 'open',
    },
    {
      readability: MetadataReadability.SYSTEM,
      isOwningApplication: false,
      expected: 'deny',
    },
    {
      readability: MetadataReadability.SYSTEM,
      isOwningApplication: true,
      expected: 'deny',
    },
    {
      readability: MetadataReadability.APPLICATION,
      isOwningApplication: false,
      expected: 'deny',
    },
    {
      readability: MetadataReadability.APPLICATION,
      isOwningApplication: true,
      expected: 'open',
    },
    {
      readability: MetadataReadability.PRIVATE,
      isOwningApplication: false,
      expected: 'private',
    },
    {
      readability: MetadataReadability.PRIVATE,
      isOwningApplication: true,
      expected: 'open',
    },
  ])(
    'should resolve $expected for $readability readability when isOwningApplication is $isOwningApplication',
    ({ readability, isOwningApplication, expected }) => {
      expect(
        resolveRecordShareGateKind({ readability, isOwningApplication }),
      ).toBe(expected);
    },
  );
});

describe('resolveRecordShareGateKind for DISCOVERABLE readability', () => {
  it.each([
    { isOwningApplication: false, isExistenceRead: false, expected: 'private' },
    { isOwningApplication: false, isExistenceRead: true, expected: 'open' },
    { isOwningApplication: true, isExistenceRead: false, expected: 'open' },
  ])(
    'should resolve $expected when isOwningApplication is $isOwningApplication and isExistenceRead is $isExistenceRead',
    ({ isOwningApplication, isExistenceRead, expected }) => {
      expect(
        resolveRecordShareGateKind({
          readability: MetadataReadability.DISCOVERABLE,
          isOwningApplication,
          isExistenceRead,
        }),
      ).toBe(expected);
    },
  );

  it('should not open a PRIVATE object to an existence read', () => {
    expect(
      resolveRecordShareGateKind({
        readability: MetadataReadability.PRIVATE,
        isOwningApplication: false,
        isExistenceRead: true,
      }),
    ).toBe('private');
  });
});
