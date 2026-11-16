import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';

const FIELD_METADATA_ID = 'field-metadata-id';

describe('getFieldPermissions', () => {
  it('should allow reading and updating a field without restriction', () => {
    expect(
      getFieldPermissions({
        objectPermissions: { unreadableFields: [], uneditableFields: [] },
        fieldMetadataId: FIELD_METADATA_ID,
      }),
    ).toEqual({ canReadField: true, canUpdateField: true });
  });

  it('should only deny what the restriction explicitly denies', () => {
    expect(
      getFieldPermissions({
        objectPermissions: {
          unreadableFields: [],
          uneditableFields: [FIELD_METADATA_ID],
        },
        fieldMetadataId: FIELD_METADATA_ID,
      }),
    ).toEqual({ canReadField: true, canUpdateField: false });
  });

  it('should deny reading a field restricted for reading', () => {
    expect(
      getFieldPermissions({
        objectPermissions: {
          unreadableFields: [FIELD_METADATA_ID],
          uneditableFields: [FIELD_METADATA_ID],
        },
        fieldMetadataId: FIELD_METADATA_ID,
      }),
    ).toEqual({ canReadField: false, canUpdateField: false });
  });
});
