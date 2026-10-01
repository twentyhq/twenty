import { compileValidationRuleExpression } from 'twenty-shared/utils';

import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { computeValidationRuleHelperContext } from '@/validation-rules/utils/computeValidationRuleHelperContext';
import { computeValidationRuleHelperItemExamples } from '@/validation-rules/utils/computeValidationRuleHelperItemExamples';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

describe('computeValidationRuleHelperItemExamples', () => {
  it.each(['opportunity', 'company', 'person'])(
    'should only suggest examples that compile on %s',
    (nameSingular) => {
      const objectMetadataItem = getMockObjectMetadataItemOrThrow(nameSingular);
      const fields = buildValidationRuleEditorFields({
        objectMetadataItem,
        objectMetadataItems,
      });
      const descriptors = buildValidationRuleFieldDescriptors({
        objectMetadataItem,
        objectMetadataItems,
      });

      const rootItems = computeValidationRuleHelperContext({
        textBeforeCursor: '',
        isCursorAfterField: false,
        fields,
      }).items;
      const memberItems = fields
        .filter(({ path }) => path.includes('.'))
        .map((field) => ({ kind: 'field' as const, field }));

      const examples = [...rootItems, ...memberItems].flatMap((item) =>
        computeValidationRuleHelperItemExamples({ item, fields }),
      );
      const failingExamples = examples.filter(
        (expression) =>
          !compileValidationRuleExpression({
            expression,
            fields: descriptors,
          }).isValid,
      );

      expect(examples.length).toBeGreaterThan(20);
      expect(failingExamples).toEqual([]);
    },
  );
});
