import { type FieldManifest } from 'twenty-shared/application';
import {
  type FieldMetadataDefaultActor,
  FieldMetadataType,
} from 'twenty-shared/types';

import { fromFieldManifestToUniversalFlatFieldMetadata } from 'src/engine/core-modules/application/application-manifest/converters/from-field-manifest-to-universal-flat-field-metadata.util';

const APP_UID = '11111111-1111-1111-1111-111111111111';
const OBJECT_UID = '22222222-2222-2222-2222-222222222222';
const FIELD_UID = '33333333-3333-3333-3333-333333333333';
const NOW = '2026-05-15T10:00:00.000Z';

const buildFieldManifest = (
  overrides: Partial<FieldManifest>,
): FieldManifest & { objectUniversalIdentifier: string } =>
  ({
    universalIdentifier: FIELD_UID,
    type: FieldMetadataType.TEXT,
    name: 'demo',
    label: 'Demo',
    objectUniversalIdentifier: OBJECT_UID,
    ...overrides,
  }) as FieldManifest & { objectUniversalIdentifier: string };

describe('fromFieldManifestToUniversalFlatFieldMetadata', () => {
  describe('composite defaultValue normalization', () => {
    it('normalizes empty-name actor defaults to the canonical four-key shape', () => {
      const result = fromFieldManifestToUniversalFlatFieldMetadata({
        fieldManifest: buildFieldManifest({
          type: FieldMetadataType.ACTOR,
          name: 'createdBy',
          label: 'Created by',
          defaultValue: { name: "''", source: "'MANUAL'" },
        }),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

      expect(result.defaultValue).toEqual({
        context: null,
        name: null,
        source: "'MANUAL'",
        workspaceMemberId: null,
      });
    });

    it('is idempotent: re-running the converter on its own output yields the same defaultValue', () => {
      const first = fromFieldManifestToUniversalFlatFieldMetadata({
        fieldManifest: buildFieldManifest({
          type: FieldMetadataType.ACTOR,
          name: 'createdBy',
          label: 'Created by',
          defaultValue: { name: "''", source: "'MANUAL'" },
        }),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

      const second = fromFieldManifestToUniversalFlatFieldMetadata({
        fieldManifest: buildFieldManifest({
          type: FieldMetadataType.ACTOR,
          name: 'createdBy',
          label: 'Created by',
          defaultValue: first.defaultValue as FieldMetadataDefaultActor,
        }),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

      expect(second.defaultValue).toEqual(first.defaultValue);
    });

    it('falls back to the generated default and normalizes it when defaultValue is omitted', () => {
      const result = fromFieldManifestToUniversalFlatFieldMetadata({
        fieldManifest: buildFieldManifest({
          type: FieldMetadataType.ACTOR,
          name: 'updatedBy',
          label: 'Updated by',
        }),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

      expect(result.defaultValue).toEqual({
        context: null,
        name: "'System'",
        source: "'MANUAL'",
        workspaceMemberId: null,
      });
    });

    it('leaves non-composite defaults untouched', () => {
      const result = fromFieldManifestToUniversalFlatFieldMetadata({
        fieldManifest: buildFieldManifest({
          type: FieldMetadataType.TEXT,
          name: 'title',
          label: 'Title',
          defaultValue: "'todo'",
        }),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

      expect(result.defaultValue).toBe("'todo'");
    });
  });
});
