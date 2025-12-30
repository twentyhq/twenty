import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';

describe('getWorkflowVisualizerComponentInstanceId', () => {
  it('should return the same recordId that was passed in', () => {
    const recordId = 'test-record-id-123';

    const result = getWorkflowVisualizerComponentInstanceId({ recordId });

    expect(result).toBe(recordId);
  });

  it('should return empty string when recordId is empty', () => {
    const recordId = '';

    const result = getWorkflowVisualizerComponentInstanceId({ recordId });

    expect(result).toBe('');
  });

  it('should handle UUID format recordIds', () => {
    const recordId = '550e8400-e29b-41d4-a716-446655440000';

    const result = getWorkflowVisualizerComponentInstanceId({ recordId });

    expect(result).toBe(recordId);
  });

  it('should handle special characters in recordId', () => {
    const recordId = 'test-record-id_with.special@chars';

    const result = getWorkflowVisualizerComponentInstanceId({ recordId });

    expect(result).toBe(recordId);
  });
});
