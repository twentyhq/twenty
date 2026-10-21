import { resolveValidationRuleIdentifierPath } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
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
      readsRelatedRecord: true,
    });
  });

  it('should mark only related-record paths as read through a relation', () => {
    expect(
      editorFields.find(({ path }) => path === 'amount')?.readsRelatedRecord,
    ).toBe(false);
    expect(
      editorFields.find(({ path }) => path === 'company')?.readsRelatedRecord,
    ).toBe(true);
  });

  describe('when icons are empty', () => {
    const company = getMockObjectMetadataItemOrThrow('company');

    const withEmptyFieldIcons = (
      objectMetadataItem: EnrichedObjectMetadataItem,
      fieldNames: string[],
    ): EnrichedObjectMetadataItem => ({
      ...objectMetadataItem,
      fields: objectMetadataItem.fields.map((field) =>
        fieldNames.includes(field.name) ? { ...field, icon: '' } : field,
      ),
    });

    it('should fall back to the default field icon', () => {
      const fields = buildValidationRuleEditorFields({
        objectMetadataItem: withEmptyFieldIcons(opportunity, ['amount']),
        objectMetadataItems,
      });

      expect(fields.find(({ path }) => path === 'amount')?.iconName).toBe(
        'IconListSearch',
      );
      expect(
        fields.find(({ path }) => path === 'amount.amountMicros')?.iconName,
      ).toBe('IconListSearch');
    });

    it('should fall back to the target object icon on a relation field', () => {
      const fields = buildValidationRuleEditorFields({
        objectMetadataItem: withEmptyFieldIcons(opportunity, ['company']),
        objectMetadataItems,
      });

      expect(fields.find(({ path }) => path === 'company')?.iconName).toBe(
        company.icon,
      );
    });

    it('should fall back to the default icons when object icons are empty', () => {
      const companyWithEmptyIcons = {
        ...withEmptyFieldIcons(company, ['employees']),
        icon: '',
      };

      const fields = buildValidationRuleEditorFields({
        objectMetadataItem: {
          ...withEmptyFieldIcons(opportunity, ['company']),
          icon: '',
        },
        objectMetadataItems: objectMetadataItems.map((objectMetadataItem) =>
          objectMetadataItem.id === company.id
            ? companyWithEmptyIcons
            : objectMetadataItem,
        ),
      });

      expect(fields.find(({ path }) => path === 'company')).toMatchObject({
        iconName: 'IconBox',
        objectIconName: 'IconBox',
      });
      expect(
        fields.find(({ path }) => path === 'company.employees'),
      ).toMatchObject({
        iconName: 'IconListSearch',
        objectIconName: 'IconBox',
      });
    });
  });
});
