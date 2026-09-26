import {
  actorFieldDefinition,
  booleanFieldDefinition,
  fieldMetadataId,
  fullNameFieldDefinition,
  morphRelationFieldDefinition,
  ratingFieldDefinition,
  relationFieldDefinition,
  richTextFieldDefinition,
  selectFieldDefinition,
  textfieldDefinition,
} from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldCurrencyMetadata,
  type FieldMetadata,
  type FieldNumberMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import {
  formatFieldValueAsPlainText,
  type FieldValuePlainTextFormatters,
} from '@/object-record/record-field/ui/utils/formatFieldValueAsPlainText';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const formatters: FieldValuePlainTextFormatters = {
  formatNumber: (value, options) =>
    value.toFixed(options?.decimals ?? 0).toString(),
  formatDate: (value) => `date:${value}`,
  formatDateTime: (value) => `datetime:${value}`,
  getRecordLabel: (record, objectNameSingular) =>
    `${objectNameSingular}:${record.name}`,
  getActorName: (fieldValue) => `actor:${fieldValue.name}`,
};

const format = (
  fieldDefinition: FieldDefinition<FieldMetadata>,
  fieldValue: unknown,
) => formatFieldValueAsPlainText({ fieldDefinition, fieldValue, formatters });

const numberFieldDefinition: FieldDefinition<FieldNumberMetadata> = {
  fieldMetadataId,
  label: 'Employees',
  iconName: 'IconUsers',
  type: FieldMetadataType.NUMBER,
  metadata: {
    fieldName: 'employees',
    placeHolder: '',
    settings: { type: 'percentage', decimals: 1 },
  },
};

const currencyFieldDefinition: FieldDefinition<FieldCurrencyMetadata> = {
  fieldMetadataId,
  label: 'Amount',
  iconName: 'IconCurrencyDollar',
  type: FieldMetadataType.CURRENCY,
  metadata: {
    fieldName: 'amount',
    placeHolder: '',
    isPositive: true,
    settings: { format: 'short', decimals: 2 },
  },
};

describe('formatFieldValueAsPlainText', () => {
  it('should return an empty string for empty values', () => {
    expect(format(textfieldDefinition, null)).toBe('');
    expect(format(textfieldDefinition, undefined)).toBe('');
  });

  it('should format text and number fields', () => {
    expect(format(textfieldDefinition, 'Hello')).toBe('Hello');
    expect(format(numberFieldDefinition, 0.125)).toBe('12.5%');
  });

  it('should format currency with full precision and currency code', () => {
    expect(
      format(currencyFieldDefinition, {
        amountMicros: 1234560000,
        currencyCode: 'USD',
      }),
    ).toBe('1234.56 USD');
    expect(
      format(currencyFieldDefinition, {
        amountMicros: null,
        currencyCode: 'USD',
      }),
    ).toBe('');
  });

  it('should format boolean, select and rating fields', () => {
    expect(format(booleanFieldDefinition, false)).toBe('False');
    expect(format(selectFieldDefinition, 'userId')).toBe('Elon Musk');
    expect(format(ratingFieldDefinition, 'RATING_3')).toBe('3');
  });

  it('should format composite fields', () => {
    expect(
      format(fullNameFieldDefinition, { firstName: 'Ada', lastName: '' }),
    ).toBe('Ada');
    expect(
      format(richTextFieldDefinition, {
        blocknote: null,
        markdown: '# Title\n',
      }),
    ).toBe('# Title');
  });

  it('should format actor and relation fields', () => {
    expect(
      format(actorFieldDefinition, {
        source: 'MANUAL',
        workspaceMemberId: null,
        name: 'Tim Apple',
        context: null,
      }),
    ).toBe('actor:Tim Apple');
    expect(
      format(relationFieldDefinition, { id: 'company-id', name: 'Airbnb' }),
    ).toBe('company:Airbnb');
    expect(
      format(morphRelationFieldDefinition, [
        {
          objectNameSingular: 'company',
          objectNamePlural: 'companies',
          value: [{ id: 'company-id', name: 'Airbnb' }],
        },
        {
          objectNameSingular: 'person',
          objectNamePlural: 'people',
          value: [{ id: 'person-id', name: 'Ada' }],
        },
      ]),
    ).toBe('company:Airbnb, person:Ada');
    expect(format(morphRelationFieldDefinition, { name: 'Airbnb' })).toBe('');
  });
});
