import { buildFormulaFieldEditorInputs } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaFieldEditorInputs';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock().map(
  (objectMetadataItem) => ({
    ...objectMetadataItem,
    fields: objectMetadataItem.fields.map((fieldMetadataItem) =>
      objectMetadataItem.nameSingular === 'company' &&
      fieldMetadataItem.name === 'employees'
        ? {
            ...fieldMetadataItem,
            settings: { formula: { expression: 'arrayLength(tagline)' } },
          }
        : fieldMetadataItem,
    ),
  }),
);

const findObjectMetadataItem = (nameSingular: string) => {
  const objectMetadataItem = objectMetadataItems.find(
    (candidate) => candidate.nameSingular === nameSingular,
  );

  if (objectMetadataItem === undefined) {
    throw new Error(`${nameSingular} object metadata item not found`);
  }

  return objectMetadataItem;
};

describe('buildFormulaFieldEditorInputs', () => {
  it('should offer the stored fields of the object and of its to-one relations', () => {
    const { fields, editorFields } = buildFormulaFieldEditorInputs({
      objectMetadataItem: findObjectMetadataItem('person'),
      objectMetadataItems,
    });
    const paths = editorFields.map(({ path }) => path);

    expect(fields.map(({ name }) => name)).toContain('jobTitle');
    expect(paths).toEqual(
      expect.arrayContaining(['jobTitle', 'company', 'company.name']),
    );
  });

  it('should leave out formula fields, on the object and behind a relation', () => {
    const companyInputs = buildFormulaFieldEditorInputs({
      objectMetadataItem: findObjectMetadataItem('company'),
      objectMetadataItems,
    });
    const personInputs = buildFormulaFieldEditorInputs({
      objectMetadataItem: findObjectMetadataItem('person'),
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
    const personObjectMetadataItem = findObjectMetadataItem('person');
    const jobTitleFieldMetadataItem = personObjectMetadataItem.fields.find(
      ({ name }) => name === 'jobTitle',
    );
    const { editorFields } = buildFormulaFieldEditorInputs({
      objectMetadataItem: personObjectMetadataItem,
      objectMetadataItems,
      fieldMetadataId: jobTitleFieldMetadataItem?.id,
    });
    const paths = editorFields.map(({ path }) => path);

    expect(paths).not.toContain('jobTitle');
    expect(paths.some((path) => path.startsWith('previous.'))).toBe(false);
  });
});
