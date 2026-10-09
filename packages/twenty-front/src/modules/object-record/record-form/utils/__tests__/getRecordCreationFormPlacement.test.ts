import { getRecordCreationFormPlacement } from '@/object-record/record-form/utils/getRecordCreationFormPlacement';

const OPEN_COMPANY_FORM_REQUEST = {
  requestId: 'request-company',
  objectMetadataId: 'object-company',
  initialDraftRecord: { employees: 10 },
};

describe('getRecordCreationFormPlacement', () => {
  it('stacks the new form when no creation form is open', () => {
    expect(
      getRecordCreationFormPlacement({
        openRecordCreationFormRequest: null,
        openRecordCreationFormDraft: null,
        objectMetadataId: 'object-company',
      }),
    ).toBe('stack');
  });

  it.each([
    ['the same object', 'object-company'],
    ['another object', 'object-person'],
  ])('replaces an untouched form, for %s', (_label, objectMetadataId) => {
    expect(
      getRecordCreationFormPlacement({
        openRecordCreationFormRequest: OPEN_COMPANY_FORM_REQUEST,
        openRecordCreationFormDraft: null,
        objectMetadataId,
      }),
    ).toBe('replace');
  });

  it('treats a form edited back to its starting values as untouched', () => {
    expect(
      getRecordCreationFormPlacement({
        openRecordCreationFormRequest: OPEN_COMPANY_FORM_REQUEST,
        openRecordCreationFormDraft: { employees: 10 },
        objectMetadataId: 'object-person',
      }),
    ).toBe('replace');
  });

  it('keeps an edited form of the same object', () => {
    expect(
      getRecordCreationFormPlacement({
        openRecordCreationFormRequest: OPEN_COMPANY_FORM_REQUEST,
        openRecordCreationFormDraft: { employees: 10, name: 'Acme' },
        objectMetadataId: 'object-company',
      }),
    ).toBe('keep');
  });

  it('stacks the new form over an edited form of another object', () => {
    expect(
      getRecordCreationFormPlacement({
        openRecordCreationFormRequest: OPEN_COMPANY_FORM_REQUEST,
        openRecordCreationFormDraft: { employees: 10, name: 'Acme' },
        objectMetadataId: 'object-person',
      }),
    ).toBe('stack');
  });
});
