import { generateMessageId } from 'twenty-shared/i18n';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { FieldMetadataType } from 'twenty-shared/types';

import { resolveEffectiveFieldDescription } from 'src/engine/core-modules/tool-provider/utils/resolve-effective-field-description.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type MessageIdTranslator } from 'src/engine/metadata-modules/utils/message-id-translator.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const BASE_DESCRIPTION = 'Task due date';
const OVERRIDDEN_DESCRIPTION =
  'Stored in UTC; users dictate local time, convert before writing';

const buildTranslator = (
  catalog: Record<string, string> = {},
): MessageIdTranslator => ({
  _: (messageId) => catalog[messageId] ?? messageId,
});

const untranslated = buildTranslator();

const getStandardFlatFieldMetadata = (
  overrides?: Parameters<typeof getFlatFieldMetadataMock>[0]['overrides'],
) =>
  getFlatFieldMetadataMock({
    universalIdentifier: 'due-at-field',
    objectMetadataId: 'task-object',
    type: FieldMetadataType.DATE_TIME,
    name: 'dueAt',
    description: BASE_DESCRIPTION,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    overrides,
  });

describe('resolveEffectiveFieldDescription', () => {
  it('should return the override when a standard field description was customized', () => {
    const result = resolveEffectiveFieldDescription({
      flatFieldMetadata: getStandardFlatFieldMetadata({
        description: OVERRIDDEN_DESCRIPTION,
      }),
      locale: SOURCE_LOCALE,
      i18nInstance: untranslated,
    });

    expect(result).toBe(OVERRIDDEN_DESCRIPTION);
  });

  it('should return the base description when the override was cleared', () => {
    const result = resolveEffectiveFieldDescription({
      flatFieldMetadata: getStandardFlatFieldMetadata({ description: null }),
      locale: SOURCE_LOCALE,
      i18nInstance: untranslated,
    });

    expect(result).toBe(BASE_DESCRIPTION);
  });

  it('should return the base description when the field carries no override', () => {
    const result = resolveEffectiveFieldDescription({
      flatFieldMetadata: getStandardFlatFieldMetadata(),
      locale: SOURCE_LOCALE,
      i18nInstance: untranslated,
    });

    expect(result).toBe(BASE_DESCRIPTION);
  });

  it('should return the locale translation of a standard field description', () => {
    const result = resolveEffectiveFieldDescription({
      flatFieldMetadata: getStandardFlatFieldMetadata(),
      locale: 'fr-FR',
      i18nInstance: buildTranslator({
        [generateMessageId(BASE_DESCRIPTION, 'fieldMetadata.description')]:
          "Date d'échéance",
      }),
    });

    expect(result).toBe("Date d'échéance");
  });

  it('should return the override translation for the requested locale', () => {
    const result = resolveEffectiveFieldDescription({
      flatFieldMetadata: getStandardFlatFieldMetadata({
        description: OVERRIDDEN_DESCRIPTION,
        translations: { 'fr-FR': { description: 'Stocké en UTC' } },
      }),
      locale: 'fr-FR',
      i18nInstance: untranslated,
    });

    expect(result).toBe('Stocké en UTC');
  });

  it('should return the description as written for a custom field', () => {
    const result = resolveEffectiveFieldDescription({
      flatFieldMetadata: getFlatFieldMetadataMock({
        universalIdentifier: 'activity-type-field',
        objectMetadataId: 'task-object',
        type: FieldMetadataType.TEXT,
        name: 'activityType',
        description: 'Our own custom text',
      }),
      locale: SOURCE_LOCALE,
      i18nInstance: untranslated,
    });

    expect(result).toBe('Our own custom text');
  });
});
