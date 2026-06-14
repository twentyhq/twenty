import { FieldMetadataType } from 'twenty-shared/types';

import { getWorkflowCodeFieldsLeafKind } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWorkflowCodeFieldsLeafKind';

describe('getWorkflowCodeFieldsLeafKind', () => {
  it('should map schema types to leaf editor kind', () => {
    expect(getWorkflowCodeFieldsLeafKind({ type: 'boolean' })).toBe('boolean');
    expect(
      getWorkflowCodeFieldsLeafKind({ type: FieldMetadataType.BOOLEAN }),
    ).toBe('boolean');
    expect(getWorkflowCodeFieldsLeafKind({ type: 'number' })).toBe('number');
    expect(
      getWorkflowCodeFieldsLeafKind({ type: FieldMetadataType.NUMBER }),
    ).toBe('number');
    expect(
      getWorkflowCodeFieldsLeafKind({ type: FieldMetadataType.NUMERIC }),
    ).toBe('number');
    expect(getWorkflowCodeFieldsLeafKind({ type: 'string' })).toBe('text');
    expect(
      getWorkflowCodeFieldsLeafKind({
        type: 'string',
        enum: ['plain', 'markdown'],
      }),
    ).toBe('enum');
    expect(
      getWorkflowCodeFieldsLeafKind({
        type: FieldMetadataType.TEXT,
        enum: ['a', 'b'],
      }),
    ).toBe('enum');
    expect(getWorkflowCodeFieldsLeafKind({ type: 'string', enum: [] })).toBe(
      'text',
    );
    expect(getWorkflowCodeFieldsLeafKind(undefined)).toBe('text');
  });
});
