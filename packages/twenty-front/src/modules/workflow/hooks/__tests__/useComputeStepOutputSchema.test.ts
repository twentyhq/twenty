import { useMutation } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { ComputeStepOutputSchemaInput } from '~/generated/graphql';
import { useComputeStepOutputSchema } from '../useComputeStepOutputSchema';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: jest.fn(),
  useApolloClient: () => ({}),
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
