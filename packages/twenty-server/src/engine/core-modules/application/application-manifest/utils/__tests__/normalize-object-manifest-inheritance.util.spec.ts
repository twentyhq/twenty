import {
  type ObjectAccessInheritance,
  ObjectAccessInheritanceMatch,
  ObjectAccessInheritanceRelationKind,
} from 'twenty-shared/types';

import { normalizeObjectManifestInheritance } from 'src/engine/core-modules/application/application-manifest/utils/normalize-object-manifest-inheritance.util';

const CANONICAL_INHERITANCE: ObjectAccessInheritance = {
  match: ObjectAccessInheritanceMatch.ALL,
  through: [
    {
      kind: ObjectAccessInheritanceRelationKind.MORPH,
      morphId: 'morph-id',
    },
  ],
};

describe('normalizeObjectManifestInheritance', () => {
  it('keeps the canonical declaration as is', () => {
    expect(
      normalizeObjectManifestInheritance({
        nameSingular: 'attachment',
        inheritance: CANONICAL_INHERITANCE,
      }),
    ).toEqual(CANONICAL_INHERITANCE);
  });

  it('returns nothing when neither form is declared', () => {
    expect(
      normalizeObjectManifestInheritance({ nameSingular: 'attachment' }),
    ).toBeNull();
  });

  it('normalizes the legacy parent field list into an ANY policy', () => {
    expect(
      normalizeObjectManifestInheritance({
        nameSingular: 'attachment',
        readabilityParentFieldUniversalIdentifiers: ['field-a', 'field-b'],
      }),
    ).toEqual({
      match: ObjectAccessInheritanceMatch.ANY,
      through: [
        {
          kind: ObjectAccessInheritanceRelationKind.FIELD,
          fieldUniversalIdentifier: 'field-a',
        },
        {
          kind: ObjectAccessInheritanceRelationKind.FIELD,
          fieldUniversalIdentifier: 'field-b',
        },
      ],
    });
  });

  it('refuses an ambiguous manifest declaring both forms', () => {
    expect(() =>
      normalizeObjectManifestInheritance({
        nameSingular: 'attachment',
        inheritance: CANONICAL_INHERITANCE,
        readabilityParentFieldUniversalIdentifiers: ['field-a'],
      }),
    ).toThrow(/keep only "inheritance"/);
  });

  it('refuses an empty legacy list instead of silently opening the object', () => {
    expect(() =>
      normalizeObjectManifestInheritance({
        nameSingular: 'attachment',
        readabilityParentFieldUniversalIdentifiers: [],
      }),
    ).toThrow(/at least one parent relation/);
  });
});
