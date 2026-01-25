import { useComputeStepOutputSchema } from '@/workflow/hooks/useComputeStepOutputSchema';
import { ApolloClient, InMemoryCache, useMutation } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { type ComputeStepOutputSchemaInput } from '~/generated/graphql';

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useMutation: vi.fn(),
  };
});
vi.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () =>
    new ApolloClient({
      uri: 'http://localhost',
      cache: new InMemoryCache(),
    }),
}));

describe('useComputeStepOutputSchema', () => {
  it('should compute schema successfully', async () => {
    const mockInput: ComputeStepOutputSchemaInput = {
      step: { type: 'object' },
      workflowVersionId: '123',
    };
    const mockResponse = {
      data: { computeStepOutputSchema: { schema: { type: 'object' } } },
    };
    const mockMutate = vi.fn().mockResolvedValue(mockResponse);
    const mockApolloClient = new ApolloClient({
      uri: 'http://localhost',
      cache: new InMemoryCache(),
    });

    vi.mocked(useMutation).mockReturnValue([
      mockMutate,
      {
        data: undefined,
        loading: false,
        error: undefined,
        called: false,
        reset: vi.fn(),
        client: mockApolloClient,
      },
    ]);

    const { result } = renderHook(() => useComputeStepOutputSchema());
    const response = await result.current.computeStepOutputSchema(mockInput);

    expect(mockMutate).toHaveBeenCalledWith({
      variables: { input: mockInput },
    });
    expect(response).toEqual(mockResponse);
  });
});
