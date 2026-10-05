import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';

const FIELD_METADATA_ID = 'field-metadata-id';

describe('getFieldPermissions', () => {
  it('should allow reading and updating a field without restriction', () => {
    expect(
      getFieldPermissions({
        objectPermissions: { restrictedFields: {} },
        fieldMetadataId: FIELD_METADATA_ID,
      }),
    ).toEqual({ canReadField: true, canUpdateField: true });
  });

  it('should only deny what the restriction explicitly denies', () => {
    expect(
      getFieldPermissions({
        objectPermissions: {
          restrictedFields: {
            [FIELD_METADATA_ID]: { canRead: null, canUpdate: false },
          },
        },
        fieldMetadataId: FIELD_METADATA_ID,
      }),
    ).toEqual({ canReadField: true, canUpdateField: false });
  });

  it('should deny reading a field restricted for reading', () => {
    expect(
      getFieldPermissions({
        objectPermissions: {
          restrictedFields: {
            [FIELD_METADATA_ID]: { canRead: false, canUpdate: false },
          },
        },
        fieldMetadataId: FIELD_METADATA_ID,
      }),
    ).toEqual({ canReadField: false, canUpdateField: false });
  });
});
