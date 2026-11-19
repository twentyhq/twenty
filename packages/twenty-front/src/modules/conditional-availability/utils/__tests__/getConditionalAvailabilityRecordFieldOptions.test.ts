import { getConditionalAvailabilityRecordFieldOptions } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldOptions';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const getOptions = (objectNameSingular: string) =>
  getConditionalAvailabilityRecordFieldOptions({
    fields: getMockObjectMetadataItemOrThrow(objectNameSingular).readableFields,
  });

const getOption = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string;
  fieldName: string;
}) =>
  getOptions(objectNameSingular).find(
    (option) => option.field.name === fieldName,
  );

const getPropertyPaths = (parameters: Parameters<typeof getOption>[0]) =>
  getOption(parameters)?.subjects.map((subject) => subject.propertyPath);

describe('getConditionalAvailabilityRecordFieldOptions', () => {
  it('lists each offered field once, sorted by label', () => {
    const labels = getOptions('opportunity').map(
      (option) => option.field.label,
    );

    expect(labels).toEqual(
      labels.toSorted((firstLabel, secondLabel) =>
        firstLabel.localeCompare(secondLabel),
      ),
    );
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('puts the default sub-field of a composite first', () => {
    expect(
      getPropertyPaths({
        objectNameSingular: 'opportunity',
        fieldName: 'amount',
      }),
    ).toEqual(['amount.amountMicros', 'amount.currencyCode']);
    expect(
      getPropertyPaths({
        objectNameSingular: 'company',
        fieldName: 'address',
      })?.[0],
    ).toBe('address.addressCity');
    expect(
      getPropertyPaths({
        objectNameSingular: 'company',
        fieldName: 'createdBy',
      }),
    ).toEqual([
      'createdBy.workspaceMemberId',
      'createdBy.source',
      'createdBy.name',
    ]);
    expect(
      getPropertyPaths({ objectNameSingular: 'person', fieldName: 'name' }),
    ).toEqual(['name.firstName', 'name.lastName']);
  });

  it('offers the address sub fields without the country', () => {
    const propertyPaths = getPropertyPaths({
      objectNameSingular: 'company',
      fieldName: 'address',
    });

    expect(propertyPaths).toHaveLength(5);
    expect(propertyPaths).not.toContain('address.addressCountry');
  });

  it('gives a plain field a single subject', () => {
    const stageOption = getOption({
      objectNameSingular: 'opportunity',
      fieldName: 'stage',
    });

    expect(stageOption?.subjects).toEqual([
      {
        fieldMetadataUniversalIdentifier:
          stageOption?.field.universalIdentifier,
        fieldName: 'stage',
        subFieldName: null,
        fieldKind: 'select',
        propertyPath: 'stage',
      },
    ]);
  });

  it('leaves out junction relations and types that are not offered', () => {
    const fieldNames = getOptions('company').map((option) => option.field.name);

    expect(fieldNames).not.toContain('caredForPets');
    expect(fieldNames).not.toContain('previousEmployees');
    expect(fieldNames).not.toContain('position');
    expect(fieldNames).not.toContain('searchVector');
    expect(fieldNames).toContain('accountOwner');
  });
});
