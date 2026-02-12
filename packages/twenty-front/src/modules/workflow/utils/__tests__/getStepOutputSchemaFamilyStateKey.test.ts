import { getStepOutputSchemaFamilyStateKey } from '@/workflow/utils/getStepOutputSchemaFamilyStateKey';

describe('getStepOutputSchemaFamilyStateKey', () => {
  it('should concatenate workflowVersionId and stepId with a dash', () => {
    const workflowVersionId = 'workflow-version-123';
    const stepId = 'step-456';

    const result = getStepOutputSchemaFamilyStateKey(workflowVersionId, stepId);

    expect(result).toBe('workflow-version-123-step-456');
  });

  it('should handle empty strings', () => {
    const workflowVersionId = '';
    const stepId = '';

    const result = getStepOutputSchemaFamilyStateKey(workflowVersionId, stepId);

    expect(result).toBe('-');
  });

  it('should handle UUID format IDs', () => {
    const workflowVersionId = '550e8400-e29b-41d4-a716-446655440000';
    const stepId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

    const result = getStepOutputSchemaFamilyStateKey(workflowVersionId, stepId);

    expect(result).toBe(
      '550e8400-e29b-41d4-a716-446655440000-6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    );
  });

  it('should handle special characters in IDs', () => {
    const workflowVersionId = 'workflow_version.123';
    const stepId = 'step@456';

    const result = getStepOutputSchemaFamilyStateKey(workflowVersionId, stepId);

    expect(result).toBe('workflow_version.123-step@456');
  });

  it('should handle numeric IDs', () => {
    const workflowVersionId = '123';
    const stepId = '456';

    const result = getStepOutputSchemaFamilyStateKey(workflowVersionId, stepId);

    expect(result).toBe('123-456');
  });
});
