import { join } from 'path';

import { readJson } from '@/cli/utilities/file/fs-utils';
import {
  type FieldManifest,
  type Manifest,
  type ObjectFieldManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { validate as isUuid } from 'uuid';

const POST_CARD_OBJECT_UNIVERSAL_IDENTIFIER =
  '54b589ca-eeed-4950-a176-358418b85c05';
const POST_CARD_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '87b675b8-dd8c-4448-b4ca-20e5a2234a1e';
const POST_CARD_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER =
  'b602dbd9-e511-49ce-b6d3-b697218dc69c';

const PRESERVED_STATUS_OPTION_IDS: Record<string, string> = {
  DRAFT: 'a1b2c3d4-0001-4000-8000-000000000001',
  SENT: 'a1b2c3d4-0002-4000-8000-000000000002',
  DELIVERED: 'a1b2c3d4-0003-4000-8000-000000000003',
  RETURNED: 'a1b2c3d4-0004-4000-8000-000000000004',
};

const PRESERVED_CATEGORY_OPTION_IDS: Record<string, string> = {
  PERSONAL: 'c1d2e3f4-0001-4000-8000-000000000001',
  BUSINESS: 'c1d2e3f4-0002-4000-8000-000000000002',
  PROMOTIONAL: 'c1d2e3f4-0003-4000-8000-000000000003',
};

export const defineFieldOptionIdsTests = (appPath: string): void => {
  const manifestOutputPath = join(appPath, '.twenty/output/manifest.json');

  let manifest: Manifest;

  beforeAll(async () => {
    manifest = await readJson<Manifest>(manifestOutputPath);
  });

  describe('select option id injection (object inline branch)', () => {
    let statusField: ObjectFieldManifest | undefined;

    beforeAll(() => {
      const postCard = manifest.objects.find(
        (object) =>
          object.universalIdentifier === POST_CARD_OBJECT_UNIVERSAL_IDENTIFIER,
      );
      statusField = postCard?.fields.find(
        (field) =>
          field.universalIdentifier ===
          POST_CARD_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      );
    });

    it('should find the inline status SELECT field with all 5 options', () => {
      expect(statusField).toBeDefined();
      expect(statusField?.type).toBe(FieldMetadataType.SELECT);
      expect(statusField?.options).toHaveLength(5);
    });

    it('should give every option a defined, valid UUID id', () => {
      for (const option of statusField?.options ?? []) {
        expect(option.id).toBeDefined();
        expect(typeof option.id).toBe('string');
        expect(isUuid(option.id)).toBe(true);
      }
    });

    it('should preserve the explicit ids from the source for the 4 pre-existing options', () => {
      for (const option of statusField?.options ?? []) {
        const expectedId = PRESERVED_STATUS_OPTION_IDS[option.value];
        if (expectedId !== undefined) {
          expect(option.id).toBe(expectedId);
        }
      }
    });

    it('should inject a fresh UUID for the LOST option that has no source id', () => {
      const lostOption = statusField?.options?.find(
        (option) => option.value === 'LOST',
      );

      expect(lostOption).toBeDefined();
      expect(lostOption?.id).toBeDefined();
      expect(isUuid(lostOption?.id ?? '')).toBe(true);
      // Injected ids must not collide with any explicit one in the same field.
      expect(Object.values(PRESERVED_STATUS_OPTION_IDS)).not.toContain(
        lostOption?.id,
      );
    });
  });

  describe('select option id injection (standalone field branch)', () => {
    let categoryField: FieldManifest | undefined;

    beforeAll(() => {
      categoryField = manifest.fields.find(
        (field) =>
          field.universalIdentifier ===
          POST_CARD_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
      );
    });

    it('should find the standalone category SELECT field with all 4 options', () => {
      expect(categoryField).toBeDefined();
      expect(categoryField?.type).toBe(FieldMetadataType.SELECT);
      expect(categoryField?.options).toHaveLength(4);
    });

    it('should give every option a defined, valid UUID id', () => {
      for (const option of categoryField?.options ?? []) {
        expect(option.id).toBeDefined();
        expect(typeof option.id).toBe('string');
        expect(isUuid(option.id)).toBe(true);
      }
    });

    it('should preserve the explicit ids from the source for the 3 pre-existing options', () => {
      for (const option of categoryField?.options ?? []) {
        const expectedId = PRESERVED_CATEGORY_OPTION_IDS[option.value];
        if (expectedId !== undefined) {
          expect(option.id).toBe(expectedId);
        }
      }
    });

    it('should inject a fresh UUID for the OTHER option that has no source id', () => {
      const otherOption = categoryField?.options?.find(
        (option) => option.value === 'OTHER',
      );

      expect(otherOption).toBeDefined();
      expect(otherOption?.id).toBeDefined();
      expect(isUuid(otherOption?.id ?? '')).toBe(true);
      expect(Object.values(PRESERVED_CATEGORY_OPTION_IDS)).not.toContain(
        otherOption?.id,
      );
    });
  });

  describe('select option id injection (manifest-wide invariant)', () => {
    it('should ensure every SELECT/MULTI_SELECT option in the manifest has a defined id', () => {
      const collectSelectOptions = (
        field: ObjectFieldManifest | FieldManifest,
      ) => {
        if (
          field.type !== FieldMetadataType.SELECT &&
          field.type !== FieldMetadataType.MULTI_SELECT
        ) {
          return [];
        }
        return field.options ?? [];
      };

      const allOptions = [
        ...manifest.objects.flatMap((object) =>
          object.fields.flatMap(collectSelectOptions),
        ),
        ...manifest.fields.flatMap(collectSelectOptions),
      ];

      expect(allOptions.length).toBeGreaterThan(0);

      for (const option of allOptions) {
        expect(option.id).toBeDefined();
        expect(isUuid(option.id)).toBe(true);
      }
    });
  });
};
