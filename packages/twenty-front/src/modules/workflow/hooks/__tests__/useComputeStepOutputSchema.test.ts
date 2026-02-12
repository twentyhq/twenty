import { useMutation } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { type ComputeStepOutputSchemaInput } from '~/generated/graphql';
import { useComputeStepOutputSchema } from '@/workflow/hooks/useComputeStepOutputSchema';

jest.mock('@apollo/client');
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({}),
}));

describe('useComputeStepOutputSchema', () => {
  it('should compute schema successfully', async () => {
    const mockInput = { stepId: '123' };
    const mockResponse = {
      data: { computeStepOutputSchema: { schema: { type: 'object' } } },
    };
    const mockMutate = jest.fn().mockResolvedValue(mockResponse);

    (useMutation as jest.Mock).mockReturnValue([mockMutate]);

    const { result } = renderHook(() => useComputeStepOutputSchema());
    const response = await result.current.computeStepOutputSchema(
      mockInput as unknown as ComputeStepOutputSchemaInput,
    );

    expect(mockMutate).toHaveBeenCalledWith({
      variables: { input: mockInput },
    });
    expect(response).toEqual(mockResponse);
  });
});
