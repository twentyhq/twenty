import { isRecordStoreMissingLoadedFields } from '@/object-record/record-show/utils/isRecordStoreMissingLoadedFields';

const LOADED_RECORD = {
  id: 'opportunity-id',
  __typename: 'Opportunity',
  name: 'Renewal',
  stage: 'NEW',
};

describe('isRecordStoreMissingLoadedFields', () => {
  it('should not wait when no record was loaded', () => {
    expect(
      isRecordStoreMissingLoadedFields({
        loadedRecord: undefined,
        storedRecord: null,
      }),
    ).toBe(false);
  });

  it('should wait while the store is empty', () => {
    expect(
      isRecordStoreMissingLoadedFields({
        loadedRecord: LOADED_RECORD,
        storedRecord: null,
      }),
    ).toBe(true);
  });

  it('should wait while the store holds a partial record from a table', () => {
    expect(
      isRecordStoreMissingLoadedFields({
        loadedRecord: LOADED_RECORD,
        storedRecord: {
          id: 'opportunity-id',
          __typename: 'Opportunity',
          name: 'Renewal',
        },
      }),
    ).toBe(true);
  });

  it('should not wait once the store holds every loaded field', () => {
    expect(
      isRecordStoreMissingLoadedFields({
        loadedRecord: LOADED_RECORD,
        storedRecord: { ...LOADED_RECORD },
      }),
    ).toBe(false);
  });

  it('should not wait when the store holds more fields than the loaded record', () => {
    expect(
      isRecordStoreMissingLoadedFields({
        loadedRecord: LOADED_RECORD,
        storedRecord: { ...LOADED_RECORD, position: 3 },
      }),
    ).toBe(false);
  });

  it('should not wait when a loaded field is stored as null', () => {
    expect(
      isRecordStoreMissingLoadedFields({
        loadedRecord: LOADED_RECORD,
        storedRecord: { ...LOADED_RECORD, stage: null },
      }),
    ).toBe(false);
  });
});
