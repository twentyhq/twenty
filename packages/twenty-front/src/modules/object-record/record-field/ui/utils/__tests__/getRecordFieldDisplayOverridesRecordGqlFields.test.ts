import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';
import { getRecordFieldDisplayOverridesRecordGqlFields } from '@/object-record/record-field/ui/utils/getRecordFieldDisplayOverridesRecordGqlFields';

const RECORD_FIELD_DISPLAY_OVERRIDES: RecordFieldDisplayOverride[] = [
  {
    objectNameSingular: 'company',
    fieldName: 'owner',
    recordGqlFields: { ownerExternalId: true },
    DisplayComponent: jest.fn(),
  },
  {
    objectNameSingular: 'company',
    fieldName: 'parent',
    recordGqlFields: { ownerExternalId: true, parentExternalId: true },
    DisplayComponent: jest.fn(),
  },
];

describe('getRecordFieldDisplayOverridesRecordGqlFields', () => {
  it('should request the fields needed by the overrides of the requested fields', () => {
    expect(
      getRecordFieldDisplayOverridesRecordGqlFields({
        recordFieldDisplayOverrides: RECORD_FIELD_DISPLAY_OVERRIDES,
        objectNameSingular: 'company',
        fieldNames: ['name', 'owner', 'parent'],
      }),
    ).toEqual({ ownerExternalId: true, parentExternalId: true });
  });

  it('should only request the fields of overrides whose field is requested', () => {
    expect(
      getRecordFieldDisplayOverridesRecordGqlFields({
        recordFieldDisplayOverrides: RECORD_FIELD_DISPLAY_OVERRIDES,
        objectNameSingular: 'company',
        fieldNames: ['owner'],
      }),
    ).toEqual({ ownerExternalId: true });
  });

  it('should request nothing more for another object', () => {
    expect(
      getRecordFieldDisplayOverridesRecordGqlFields({
        recordFieldDisplayOverrides: RECORD_FIELD_DISPLAY_OVERRIDES,
        objectNameSingular: 'opportunity',
        fieldNames: ['owner', 'parent'],
      }),
    ).toEqual({});
  });
});
