import { getWorkflowCodeFieldsEnumSelectOptions } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWorkflowCodeFieldsEnumSelectOptions';

describe('getWorkflowCodeFieldsEnumSelectOptions', () => {
  it('should build select options from schema enum', () => {
    expect(
      getWorkflowCodeFieldsEnumSelectOptions({
        type: 'string',
        enum: ['plain', 'markdown'],
      }),
    ).toEqual([
      { value: 'plain', label: 'plain' },
      { value: 'markdown', label: 'markdown' },
    ]);
  });

  it('should return empty array when property has no enum', () => {
    expect(getWorkflowCodeFieldsEnumSelectOptions({ type: 'string' })).toEqual(
      [],
    );
    expect(getWorkflowCodeFieldsEnumSelectOptions(undefined)).toEqual([]);
  });
});
