import { getEagerRecordFieldMetadataItems } from '@/object-record/record-field/on-demand/utils/getEagerRecordFieldMetadataItems';
import { FieldMetadataType } from 'twenty-shared/types';

const titleField = { id: 'title-field', type: FieldMetadataType.TEXT };
const transcriptField = {
  id: 'transcript-field',
  type: FieldMetadataType.RAW_JSON,
  settings: { isValueLoadedOnOpen: true },
};

const configuredCustomField = {
  ...transcriptField,
  id: 'custom-json-field',
  isUIEditable: true,
};

describe('getEagerRecordFieldMetadataItems', () => {
  it('omits configured built-in and custom JSON fields from saved views', () => {
    expect(
      getEagerRecordFieldMetadataItems({
        visibleFieldMetadataItems: [
          titleField,
          transcriptField,
          configuredCustomField,
        ],
        requiredFieldMetadataItems: [],
        isOnDemandFieldsEnabled: true,
      }),
    ).toEqual([titleField]);
  });

  it('preserves current selections when the feature flag is disabled', () => {
    expect(
      getEagerRecordFieldMetadataItems({
        visibleFieldMetadataItems: [
          titleField,
          transcriptField,
          configuredCustomField,
        ],
        requiredFieldMetadataItems: [],
        isOnDemandFieldsEnabled: false,
      }),
    ).toEqual([titleField, transcriptField, configuredCustomField]);
  });

  it('keeps configured JSON needed for local filter matching', () => {
    expect(
      getEagerRecordFieldMetadataItems({
        visibleFieldMetadataItems: [
          titleField,
          transcriptField,
          configuredCustomField,
        ],
        requiredFieldMetadataItems: [configuredCustomField],
        isOnDemandFieldsEnabled: true,
      }),
    ).toEqual([titleField, configuredCustomField]);
  });

  it('keeps hidden required fields and deduplicates dependencies', () => {
    expect(
      getEagerRecordFieldMetadataItems({
        visibleFieldMetadataItems: [titleField],
        requiredFieldMetadataItems: [titleField, transcriptField],
        isOnDemandFieldsEnabled: true,
      }),
    ).toEqual([titleField, transcriptField]);
  });

  it('keeps unconfigured JSON and explicit opt-outs eager', () => {
    const unconfiguredField = {
      id: 'unconfigured',
      type: FieldMetadataType.RAW_JSON,
    };
    const disabledField = {
      ...transcriptField,
      settings: { isValueLoadedOnOpen: false },
    };

    expect(
      getEagerRecordFieldMetadataItems({
        visibleFieldMetadataItems: [unconfiguredField, disabledField],
        requiredFieldMetadataItems: [],
        isOnDemandFieldsEnabled: true,
      }),
    ).toEqual([unconfiguredField, disabledField]);
  });
});
