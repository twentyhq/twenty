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

    it('should inject a fresh UUID for the OTHER option that has no source id', () => {
      const otherOption = categoryField?.options?.find(
        (option) => option.value === 'OTHER',
      );

      expect(otherOption).toBeDefined();
      expect(otherOption?.id).toBeDefined();
      expect(isUuid(otherOption?.id ?? '')).toBe(true);
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
