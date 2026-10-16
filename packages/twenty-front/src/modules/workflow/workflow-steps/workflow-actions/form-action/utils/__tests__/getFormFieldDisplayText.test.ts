import { FORM_FIELD_DEFAULT_TEXTS } from '@/workflow/workflow-steps/workflow-actions/form-action/constants/FormFieldDefaultTexts';
import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { getFormFieldDisplayText } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getFormFieldDisplayText';
import { i18n } from '@lingui/core';
import { FieldMetadataType } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

const getDefaultTextMessageId = (type: WorkflowFormFieldType, text: string) =>
  FORM_FIELD_DEFAULT_TEXTS.find(
    (formFieldDefaultText) =>
      formFieldDefaultText.type === type && formFieldDefaultText.text === text,
  )?.message.id ?? '';

describe('getFormFieldDisplayText', () => {
  beforeEach(() => {
    i18n.load('fr-FR', {
      [getDefaultTextMessageId(FieldMetadataType.TEXT, 'Text')]: 'Texte',
      [getDefaultTextMessageId(FieldMetadataType.TEXT, 'Enter your text')]:
        'Saisissez votre texte',
    });
    i18n.activate('fr-FR');
  });

  afterEach(() => {
    i18n.activate(SOURCE_LOCALE);
  });

  it('should translate the English default saved for the field type', () => {
    expect(
      getFormFieldDisplayText({ type: FieldMetadataType.TEXT, text: 'Text' }),
    ).toBe('Texte');
    expect(
      getFormFieldDisplayText({
        type: FieldMetadataType.TEXT,
        text: 'Enter your text',
      }),
    ).toBe('Saisissez votre texte');
  });

  it('should keep a text the user typed', () => {
    expect(
      getFormFieldDisplayText({
        type: FieldMetadataType.TEXT,
        text: 'Your company name',
      }),
    ).toBe('Your company name');
  });

  it('should keep a default saved for another field type', () => {
    expect(
      getFormFieldDisplayText({ type: FieldMetadataType.NUMBER, text: 'Text' }),
    ).toBe('Text');
  });

  it('should know every translatable default that getDefaultFormFieldSettings saves', () => {
    const formFieldTypes: WorkflowFormFieldType[] = [
      FieldMetadataType.TEXT,
      FieldMetadataType.NUMBER,
      FieldMetadataType.DATE,
      'RECORD',
      FieldMetadataType.SELECT,
      FieldMetadataType.MULTI_SELECT,
    ];
    const untranslatedDefaults = ['1000', 'mm/dd/yyyy'];

    for (const formFieldType of formFieldTypes) {
      const { label, placeholder } = getDefaultFormFieldSettings(formFieldType);

      for (const text of [label, placeholder]) {
        if (untranslatedDefaults.includes(text)) {
          continue;
        }

        expect(getDefaultTextMessageId(formFieldType, text)).not.toBe('');
      }
    }
  });
});
