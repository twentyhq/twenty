import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isWorkflowRelatedObjectMetadata } from '@/object-metadata/utils/isWorkflowRelatedObjectMetadata';

describe('isWorkflowRelatedObjectMetadata', () => {
  it('should return true for Workflow object', () => {
    const result = isWorkflowRelatedObjectMetadata(
      CoreObjectNameSingular.Workflow,
    );

    expect(result).toBe(true);
  });

  it('should return true for WorkflowVersion object', () => {
    const result = isWorkflowRelatedObjectMetadata(
      CoreObjectNameSingular.WorkflowVersion,
    );

    expect(result).toBe(true);
  });

  it('should return true for WorkflowRun object', () => {
    const result = isWorkflowRelatedObjectMetadata(
      CoreObjectNameSingular.WorkflowRun,
    );

    expect(result).toBe(true);
  });

  it('should return false for non-workflow related objects', () => {
    const result = isWorkflowRelatedObjectMetadata(
      CoreObjectNameSingular.Company,
    );

    expect(result).toBe(false);
  });

  it('should return false for unknown object names', () => {
    const result = isWorkflowRelatedObjectMetadata('unknownObject');

    expect(result).toBe(false);
  });

  it('should return false for Person object', () => {
    const result = isWorkflowRelatedObjectMetadata(
      CoreObjectNameSingular.Person,
    );

    expect(result).toBe(false);
  });
});
