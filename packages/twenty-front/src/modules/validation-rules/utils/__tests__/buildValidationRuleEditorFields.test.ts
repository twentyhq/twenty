import { resolveValidationRuleIdentifierPath } from 'twenty-shared/utils';

import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const opportunity = getMockObjectMetadataItemOrThrow('opportunity');

const editorFields = buildValidationRuleEditorFields({
  objectMetadataItem: opportunity,
  objectMetadataItems,
});
const paths = editorFields.map(({ path }) => path);

describe('buildValidationRuleEditorFields', () => {
  it('should offer own fields, composite subfields and to-one relation members', () => {
    expect(paths).toEqual(
      expect.arrayContaining([
        'name',
        'amount',
        'amount.amountMicros',
        'company',
        'company.employees',
      ]),
    );
  });

  it('should leave out to-many relations', () => {
    expect(paths).not.toContain('taskTargets');
    expect(paths.some((path) => path.startsWith('taskTargets.'))).toBe(false);
  });

  it('should only offer paths the rule compiler resolves', () => {
    const descriptors = buildValidationRuleFieldDescriptors({
      objectMetadataItem: opportunity,
      objectMetadataItems,
    });

    const unresolvedPaths = paths.filter(
      (path) =>
        !resolveValidationRuleIdentifierPath({ path, fields: descriptors })
          .isResolved,
    );

    expect(unresolvedPaths).toEqual([]);
  });

  it('should label relation members with their parent', () => {
    expect(
      editorFields.find(({ path }) => path === 'company.employees'),
    ).toMatchObject({
      label: 'Employees',
      parentLabel: 'Company',
      objectLabelSingular: 'Company',
    });
  });
});
