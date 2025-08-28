import { getNodeVariantFromStepRunStatus } from '@/workflow/workflow-diagram/utils/getNodeVariantFromStepRunStatus';
import { StepStatus } from 'twenty-shared/workflow';

describe('getNodeVariantFromRunStatus', () => {
  it('should return proper variant', () => {
    expect(getNodeVariantFromStepRunStatus(StepStatus.SUCCESS)).toBe('success');
    expect(getNodeVariantFromStepRunStatus(StepStatus.STOPPED)).toBe('success');
    expect(getNodeVariantFromStepRunStatus(StepStatus.FAILED)).toBe('failure');
    expect(getNodeVariantFromStepRunStatus(StepStatus.RUNNING)).toBe('running');
    expect(getNodeVariantFromStepRunStatus(StepStatus.PENDING)).toBe('running');
    expect(getNodeVariantFromStepRunStatus(StepStatus.NOT_STARTED)).toBe(
      'not-executed',
    );
    expect(getNodeVariantFromStepRunStatus(undefined)).toBe('default');
  });
});
