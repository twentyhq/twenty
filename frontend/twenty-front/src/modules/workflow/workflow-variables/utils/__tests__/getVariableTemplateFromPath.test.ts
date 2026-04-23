import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';

describe('getVariableTemplateFromPath', () => {
  it('should return stepId template when path is empty', () => {
    const result = getVariableTemplateFromPath({
      stepId: 'step-1',
      path: [],
    });

    expect(result).toBe('{{step-1}}');
  });

  it('should return stepId with path', () => {
    const result = getVariableTemplateFromPath({
      stepId: 'step-2',
      path: ['company', 'name'],
    });

    expect(result).toBe('{{step-2.company.name}}');
  });
});
