import { type ObjectManifest } from 'twenty-shared/application';

import { fromObjectManifestToUniversalFlatObjectMetadata } from 'src/engine/core-modules/application/application-manifest/converters/from-object-manifest-to-universal-flat-object-metadata.util';

const APP_UID = '11111111-1111-1111-1111-111111111111';
const OBJECT_UID = '22222222-2222-2222-2222-222222222222';
const LABEL_IDENTIFIER_FIELD_UID = '33333333-3333-3333-3333-333333333333';
const NOW = '2026-05-15T10:00:00.000Z';

const buildObjectManifest = (
  overrides: Partial<ObjectManifest>,
): ObjectManifest =>
  ({
    universalIdentifier: OBJECT_UID,
    nameSingular: 'pet',
    namePlural: 'pets',
    labelSingular: 'Pet',
    labelPlural: 'Pets',
    fields: [],
    labelIdentifierFieldMetadataUniversalIdentifier: LABEL_IDENTIFIER_FIELD_UID,
    ...overrides,
  }) as ObjectManifest;

describe('fromObjectManifestToUniversalFlatObjectMetadata', () => {
  describe('UI capability flags', () => {
    it('defaults isUICreatable and isUIEditable to true when omitted from the manifest', () => {
      const result = fromObjectManifestToUniversalFlatObjectMetadata({
        objectManifest: buildObjectManifest({}),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

      expect(result.isUICreatable).toBe(true);
      expect(result.isUIEditable).toBe(true);
    });

    it('uses the manifest values when set to false', () => {
      const result = fromObjectManifestToUniversalFlatObjectMetadata({
        objectManifest: buildObjectManifest({
          isUICreatable: false,
          isUIEditable: false,
        }),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

      expect(result.isUICreatable).toBe(false);
      expect(result.isUIEditable).toBe(false);
    });

    it('keeps the two flags independent', () => {
      const result = fromObjectManifestToUniversalFlatObjectMetadata({
        objectManifest: buildObjectManifest({ isUICreatable: false }),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

      expect(result.isUICreatable).toBe(false);
      expect(result.isUIEditable).toBe(true);
    });
  });
});
