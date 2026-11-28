import { buildFormulaFieldEditorInputs } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaFieldEditorInputs';
import { getFormulaExpressionEvaluation } from '@/settings/data-model/fields/forms/formula/utils/getFormulaExpressionEvaluation';
import { isDefined } from 'twenty-shared/utils';

import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const companyObjectMetadataItem = objectMetadataItems.find(
  ({ nameSingular }) => nameSingular === 'company',
);

if (!isDefined(companyObjectMetadataItem)) {
  throw new Error('Missing company object metadata mock');
}

const { fields } = buildFormulaFieldEditorInputs({
  objectMetadataItem: companyObjectMetadataItem,
  objectMetadataItems,
});

describe('getFormulaExpressionEvaluation', () => {
  it('should store an expression that aggregates related records', () => {
    expect(
      getFormulaExpressionEvaluation({ expression: 'count(people)', fields }),
    ).toBe('STORED');
  });

  it('should compute any other expression on every read', () => {
    expect(
      getFormulaExpressionEvaluation({ expression: 'employees * 2', fields }),
    ).toBe('QUERY_TIME');
  });

  it('should have no evaluation for an empty or invalid expression', () => {
    expect(getFormulaExpressionEvaluation({ expression: '', fields })).toBe(
      undefined,
    );
    expect(
      getFormulaExpressionEvaluation({ expression: 'missing * 2', fields }),
    ).toBe(undefined);
  });
});
