import { getFormMultiRecordPickerDraftValue } from '@/object-record/record-field/ui/form-types/utils/getFormMultiRecordPickerDraftValue';

describe('getFormMultiRecordPickerDraftValue', () => {
  it('should keep arrays of record ids and variables as static values', () => {
    expect(
      getFormMultiRecordPickerDraftValue([
        '20202020-aaaa-4bbb-8ccc-111111111111',
        '{{trigger.record.id}}',
      ]),
    ).toEqual({
      type: 'static',
      value: ['20202020-aaaa-4bbb-8ccc-111111111111', '{{trigger.record.id}}'],
    });
  });

  it('should map a standalone variable string to a variable value', () => {
    expect(getFormMultiRecordPickerDraftValue('{{step1.companies}}')).toEqual({
      type: 'variable',
      value: '{{step1.companies}}',
    });
  });

  it('should wrap a single record id string into an array', () => {
    expect(
      getFormMultiRecordPickerDraftValue(
        '20202020-aaaa-4bbb-8ccc-111111111111',
      ),
    ).toEqual({
      type: 'static',
      value: ['20202020-aaaa-4bbb-8ccc-111111111111'],
    });
  });

  it('should drop array entries that are neither record ids nor variables', () => {
    expect(
      getFormMultiRecordPickerDraftValue([
        '20202020-aaaa-4bbb-8ccc-111111111111',
        'not-a-uuid',
        '{{step1.companies}}',
        123 as unknown as string,
      ]),
    ).toEqual({
      type: 'static',
      value: ['20202020-aaaa-4bbb-8ccc-111111111111', '{{step1.companies}}'],
    });
  });

  it('should keep only record ids and variables from a JSON array string', () => {
    expect(
      getFormMultiRecordPickerDraftValue(
        '["20202020-aaaa-4bbb-8ccc-111111111111", "{{step1.companies}}", "junk"]',
      ),
    ).toEqual({
      type: 'static',
      value: ['20202020-aaaa-4bbb-8ccc-111111111111', '{{step1.companies}}'],
    });
  });

  it('should degrade a JSON array of plain strings to an empty selection', () => {
    expect(getFormMultiRecordPickerDraftValue('["a", "b"]')).toEqual({
      type: 'static',
      value: [],
    });
  });

  it('should degrade legacy free text, null and undefined to an empty selection', () => {
    expect(getFormMultiRecordPickerDraftValue('some free text')).toEqual({
      type: 'static',
      value: [],
    });
    expect(getFormMultiRecordPickerDraftValue(null)).toEqual({
      type: 'static',
      value: [],
    });
    expect(getFormMultiRecordPickerDraftValue(undefined)).toEqual({
      type: 'static',
      value: [],
    });
  });
});
