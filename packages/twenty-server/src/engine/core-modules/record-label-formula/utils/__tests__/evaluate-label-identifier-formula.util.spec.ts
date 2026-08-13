import { evaluateLabelIdentifierFormula } from 'src/engine/core-modules/record-label-formula/utils/evaluate-label-identifier-formula.util';

const formula = {
  template: '{0} - {1}',
  fieldReferences: [
    {
      fieldMetadataUniversalIdentifiers: ['cohort'],
    },
    {
      fieldMetadataUniversalIdentifiers: [
        'funderOrganization',
        'funderContact',
      ],
    },
  ],
};

describe('evaluateLabelIdentifierFormula', () => {
  it('interpolates field values into the template', () => {
    expect(
      evaluateLabelIdentifierFormula({
        formula,
        resolveFieldValue: (fieldUniversalIdentifier) =>
          ({
            cohort: '2026',
            funderOrganization: 'Example Foundation',
            funderContact: 'Ada Lovelace',
          })[fieldUniversalIdentifier] ?? '',
      }),
    ).toBe('2026 - Example Foundation');
  });

  it('uses the first non-empty fallback field', () => {
    expect(
      evaluateLabelIdentifierFormula({
        formula,
        resolveFieldValue: (fieldUniversalIdentifier) =>
          ({
            cohort: '2026',
            funderOrganization: '',
            funderContact: 'Ada Lovelace',
          })[fieldUniversalIdentifier] ?? '',
      }),
    ).toBe('2026 - Ada Lovelace');
  });

  it('returns an empty label when every referenced value is empty', () => {
    expect(
      evaluateLabelIdentifierFormula({
        formula,
        resolveFieldValue: () => '',
      }),
    ).toBe('');
  });
});
