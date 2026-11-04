import { getWorkflowCodeFieldsEnumArraySelectOptions } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWorkflowCodeFieldsEnumArraySelectOptions';
import { type InputSchemaProperty } from 'twenty-shared/workflow';

const ITEMS_PROPERTY: InputSchemaProperty = {
  type: 'string',
  enum: ['email', 'sms'],
};

describe('getWorkflowCodeFieldsEnumArraySelectOptions', () => {
  it('should keep selected values missing from the enum as options', () => {
    expect(
      getWorkflowCodeFieldsEnumArraySelectOptions({
        itemsProperty: ITEMS_PROPERTY,
        selectedValues: ['sms', 'fax', 'fax'],
      }),
    ).toEqual([
      { value: 'email', label: 'email' },
      { value: 'sms', label: 'sms' },
      { value: 'fax', label: 'fax' },
    ]);
  });

  it('should only return the enum options for a variable', () => {
    expect(
      getWorkflowCodeFieldsEnumArraySelectOptions({
        itemsProperty: ITEMS_PROPERTY,
        selectedValues: '{{trigger.fields}}',
      }),
    ).toEqual([
      { value: 'email', label: 'email' },
      { value: 'sms', label: 'sms' },
    ]);
  });
});
