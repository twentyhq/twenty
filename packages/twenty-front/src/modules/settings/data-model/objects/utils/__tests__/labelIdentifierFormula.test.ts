import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  formatLabelIdentifierFormulaForInput,
  parseLabelIdentifierFormulaInput,
} from '@/settings/data-model/objects/utils/labelIdentifierFormula';
import { FieldMetadataType } from 'twenty-shared/types';

const fieldMetadataItems = [
  {
    id: 'cohort-id',
    universalIdentifier: 'cohort-universal-id',
    name: 'cohort',
    label: 'Cohort',
    type: FieldMetadataType.SELECT,
  },
  {
    id: 'fellow-id',
    universalIdentifier: 'fellow-universal-id',
    name: 'fellow',
    label: 'Fellow',
    type: FieldMetadataType.RELATION,
  },
  {
    id: 'funder-organization-id',
    universalIdentifier: 'funder-organization-universal-id',
    name: 'funderOrganization',
    label: 'Funder Organization',
    type: FieldMetadataType.RELATION,
  },
  {
    id: 'funder-contact-id',
    universalIdentifier: 'funder-contact-universal-id',
    name: 'funderContact',
    label: 'Funder Contact',
    type: FieldMetadataType.RELATION,
  },
] as FieldMetadataItem[];

describe('labelIdentifierFormula', () => {
  it('parses field references into stable universal identifiers', () => {
    expect(
      parseLabelIdentifierFormulaInput({
        fieldMetadataItems,
        formulaInput: '{cohort} - {fellow}',
      }),
    ).toEqual({
      status: 'valid',
      formula: {
        template: '{0} - {1}',
        fieldReferences: [
          {
            fieldMetadataUniversalIdentifiers: ['cohort-universal-id'],
          },
          {
            fieldMetadataUniversalIdentifiers: ['fellow-universal-id'],
          },
        ],
      },
    });
  });

  it('supports ordered fallbacks', () => {
    const parsedFormula = parseLabelIdentifierFormulaInput({
      fieldMetadataItems,
      formulaInput: '{cohort} - {funderOrganization ?? funderContact}',
    });

    expect(parsedFormula).toMatchObject({
      status: 'valid',
      formula: {
        template: '{0} - {1}',
        fieldReferences: [
          {
            fieldMetadataUniversalIdentifiers: ['cohort-universal-id'],
          },
          {
            fieldMetadataUniversalIdentifiers: [
              'funder-organization-universal-id',
              'funder-contact-universal-id',
            ],
          },
        ],
      },
    });
  });

  it('rejects unknown fields', () => {
    expect(
      parseLabelIdentifierFormulaInput({
        fieldMetadataItems,
        formulaInput: '{unknownField}',
      }),
    ).toEqual({
      status: 'invalid',
      error:
        'Field "unknownField" does not exist or cannot be used in a record label formula',
    });
  });

  it('rejects unmatched braces', () => {
    expect(
      parseLabelIdentifierFormulaInput({
        fieldMetadataItems,
        formulaInput: '{cohort - {fellow}',
      }),
    ).toEqual({
      status: 'invalid',
      error: 'Use braces around each field API name',
    });
  });

  it('formats stored formulas with current field names', () => {
    expect(
      formatLabelIdentifierFormulaForInput({
        fieldMetadataItems,
        formula: {
          template: '{0} - {1}',
          fieldReferences: [
            {
              fieldMetadataUniversalIdentifiers: ['cohort-universal-id'],
            },
            {
              fieldMetadataUniversalIdentifiers: [
                'funder-organization-universal-id',
                'funder-contact-universal-id',
              ],
            },
          ],
        },
      }),
    ).toBe('{cohort} - {funderOrganization ?? funderContact}');
  });
});
