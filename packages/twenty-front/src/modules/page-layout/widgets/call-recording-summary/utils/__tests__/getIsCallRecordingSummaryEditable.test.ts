import { getIsCallRecordingSummaryEditable } from '@/page-layout/widgets/call-recording-summary/utils/getIsCallRecordingSummaryEditable';

const SUMMARY_FIELD_METADATA_ID = 'summary-field-metadata-id';

describe('getIsCallRecordingSummaryEditable', () => {
  it('allows editing when the record is writable and the field is unrestricted', () => {
    expect(
      getIsCallRecordingSummaryEditable({
        isCallRecordingReadOnly: false,
        callRecordingObjectPermissions: { restrictedFields: {} },
        summaryFieldMetadataId: SUMMARY_FIELD_METADATA_ID,
      }),
    ).toBe(true);
  });

  it('refuses editing when the record is read-only', () => {
    expect(
      getIsCallRecordingSummaryEditable({
        isCallRecordingReadOnly: true,
        callRecordingObjectPermissions: { restrictedFields: {} },
        summaryFieldMetadataId: SUMMARY_FIELD_METADATA_ID,
      }),
    ).toBe(false);
  });

  it('refuses editing when the summary field cannot be updated', () => {
    expect(
      getIsCallRecordingSummaryEditable({
        isCallRecordingReadOnly: false,
        callRecordingObjectPermissions: {
          restrictedFields: {
            [SUMMARY_FIELD_METADATA_ID]: { canRead: true, canUpdate: false },
          },
        },
        summaryFieldMetadataId: SUMMARY_FIELD_METADATA_ID,
      }),
    ).toBe(false);
  });

  it('refuses editing when the summary field is missing from metadata', () => {
    expect(
      getIsCallRecordingSummaryEditable({
        isCallRecordingReadOnly: false,
        callRecordingObjectPermissions: { restrictedFields: {} },
        summaryFieldMetadataId: undefined,
      }),
    ).toBe(false);
  });
});
