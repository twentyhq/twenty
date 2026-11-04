import { getWorkflowCodeFieldsEnumArraySelectOptions } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWorkflowCodeFieldsEnumArraySelectOptions';
import { type InputSchemaProperty } from 'twenty-shared/workflow';

const ITEMS_PROPERTY: InputSchemaProperty = {
  type: 'string',
  enum: ['work_email', 'job_title'],
};

describe('getWorkflowCodeFieldsEnumArraySelectOptions', () => {
  it('should keep selected values missing from the enum as options', () => {
    expect(
      getWorkflowCodeFieldsEnumArraySelectOptions({
        itemsProperty: ITEMS_PROPERTY,
        selectedValues: ['job_title', 'legacy_field', 'legacy_field'],
      }),
    ).toEqual([
      { value: 'work_email', label: 'work_email' },
      { value: 'job_title', label: 'job_title' },
      { value: 'legacy_field', label: 'legacy_field' },
    ]);
  });

  it('should only return the enum options for a variable', () => {
    expect(
      getWorkflowCodeFieldsEnumArraySelectOptions({
        itemsProperty: ITEMS_PROPERTY,
        selectedValues: '{{trigger.fields}}',
      }),
    ).toEqual([
      { value: 'work_email', label: 'work_email' },
      { value: 'job_title', label: 'job_title' },
    ]);
  });
});
