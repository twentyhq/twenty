import { buildFormulaFieldEditorInputs } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaFieldEditorInputs';
import { type FieldMetadataFormula } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const COMPANY_FORMULA_SETTINGS_BY_FIELD_NAME: Partial<
  Record<string, { formula: FieldMetadataFormula }>
> = {
  employees: { formula: { expression: 'arrayLength(tagline)' } },
  idealCustomerProfile: {
    formula: { expression: 'count(people) > 10', evaluation: 'STORED' },
  },
};

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock().map(
  (objectMetadataItem) => ({
    ...objectMetadataItem,
    fields: objectMetadataItem.fields.map((fieldMetadataItem) => {
      const formulaSettings =
        COMPANY_FORMULA_SETTINGS_BY_FIELD_NAME[fieldMetadataItem.name];

      if (
        objectMetadataItem.nameSingular !== 'company' ||
        !isDefined(formulaSettings)
      ) {
        return fieldMetadataItem;
      }

      return { ...fieldMetadataItem, settings: formulaSettings };
    }),
  }),
);

const findObjectMetadataItemOrThrow = (nameSingular: string) => {
  const objectMetadataItem = objectMetadataItems.find(
    (candidate) => candidate.nameSingular === nameSingular,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(`${nameSingular} object metadata item not found`);
  }

  return objectMetadataItem;
};

describe('buildFormulaFieldEditorInputs', () => {
  it('should offer the stored fields of the object and of its to-one relations', () => {
    const { fields, editorFields } = buildFormulaFieldEditorInputs({
      objectMetadataItem: findObjectMetadataItemOrThrow('person'),
      objectMetadataItems,
    });
    const paths = editorFields.map(({ path }) => path);

    expect(fields.map(({ name }) => name)).toContain('jobTitle');
    expect(paths).toEqual(
      expect.arrayContaining(['jobTitle', 'company', 'company.name']),
    );
  });

  it('should offer one-to-many relations and the fields of their records, for aggregates', () => {
    const { fields, editorFields } = buildFormulaFieldEditorInputs({
      objectMetadataItem: findObjectMetadataItemOrThrow('company'),
      objectMetadataItems,
    });

    expect(
      fields
        .find(({ name }) => name === 'people')
        ?.relationTargetFields?.map(({ name }) => name),
    ).toContain('jobTitle');
    expect(editorFields.map(({ path }) => path)).toEqual(
      expect.arrayContaining(['people', 'people.jobTitle']),
    );
  });

  it('should offer stored formula fields, which other formulas can read', () => {
    const { fields } = buildFormulaFieldEditorInputs({
      objectMetadataItem: findObjectMetadataItemOrThrow('company'),
      objectMetadataItems,
    });

    expect(fields.map(({ name }) => name)).toContain('idealCustomerProfile');
  });

  it('should leave out query-time formula fields, on the object and behind a relation', () => {
    const companyInputs = buildFormulaFieldEditorInputs({
      objectMetadataItem: findObjectMetadataItemOrThrow('company'),
      objectMetadataItems,
    });
    const personInputs = buildFormulaFieldEditorInputs({
      objectMetadataItem: findObjectMetadataItemOrThrow('person'),
      objectMetadataItems,
    });

    expect(companyInputs.fields.map(({ name }) => name)).not.toContain(
      'employees',
    );
    expect(personInputs.editorFields.map(({ path }) => path)).not.toContain(
      'company.employees',
    );
  });

  it('should leave out the field being edited and previous values', () => {
    const personObjectMetadataItem = findObjectMetadataItemOrThrow('person');
    const jobTitleFieldMetadataItem = personObjectMetadataItem.fields.find(
      ({ name }) => name === 'jobTitle',
    );

    if (!isDefined(jobTitleFieldMetadataItem)) {
      throw new Error('The person mock has no jobTitle field');
    }

    const { editorFields } = buildFormulaFieldEditorInputs({
      objectMetadataItem: personObjectMetadataItem,
      objectMetadataItems,
      fieldMetadataId: jobTitleFieldMetadataItem.id,
    });
    const paths = editorFields.map(({ path }) => path);

    expect(paths).not.toContain('jobTitle');
    expect(paths.some((path) => path.startsWith('previous.'))).toBe(false);
  });
});
