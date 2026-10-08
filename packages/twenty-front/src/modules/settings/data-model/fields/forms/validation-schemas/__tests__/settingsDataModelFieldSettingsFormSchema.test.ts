import { settingsDataModelFieldSettingsFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsDataModelFieldSettingsFormSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('settingsDataModelFieldSettingsFormSchema', () => {
  it.each([true, false])(
    'retains JSON loading configuration %s and sibling settings on submission',
    (isValueLoadedOnOpen) => {
      const settings = { isValueLoadedOnOpen, integrationSetting: 'preserved' };
      const result = settingsDataModelFieldSettingsFormSchema.parse({
        type: FieldMetadataType.RAW_JSON,
        settings,
      });

      expect(result).toEqual({
        type: FieldMetadataType.RAW_JSON,
        settings,
        isUnique: false,
      });
    },
  );

  it.each([undefined, null, {}])(
    'allows JSON fields without loading configuration (%j)',
    (settings) => {
      expect(
        settingsDataModelFieldSettingsFormSchema.safeParse({
          type: FieldMetadataType.RAW_JSON,
          settings,
        }).success,
      ).toBe(true);
    },
  );

  it.each(['true', 1, null])(
    'rejects non-boolean loading configuration (%j)',
    (isValueLoadedOnOpen) => {
      expect(
        settingsDataModelFieldSettingsFormSchema.safeParse({
          type: FieldMetadataType.RAW_JSON,
          settings: { isValueLoadedOnOpen },
        }).success,
      ).toBe(false);
    },
  );
});
