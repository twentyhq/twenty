import { renderHook } from '@testing-library/react';
import { useUpdateAgentLabel } from '@/workflow/workflow-steps/hooks/useUpdateAgentLabel';

const mockUpdateAgent = jest.fn();
const mockUseFindOneAgentQuery = jest.fn();

jest.mock('~/generated-metadata/graphql', () => ({
  useFindOneAgentQuery: jest.fn(),
  useUpdateOneAgentMutation: () => [mockUpdateAgent],
}));

describe('useUpdateAgentLabel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFindOneAgentQuery.mockReturnValue({
      data: undefined,
    });
    (
      require('~/generated-metadata/graphql').useFindOneAgentQuery as jest.Mock
    ).mockImplementation(mockUseFindOneAgentQuery);
  });

  it('should skip query when agentId is undefined', () => {
    renderHook(() => useUpdateAgentLabel(undefined));

    expect(mockUseFindOneAgentQuery).toHaveBeenCalledWith({
      variables: { id: '' },
      skip: true,
    });
  });

  it('should fetch agent when agentId is provided', () => {
    const mockAgent = {
      id: 'agent-123',
      label: 'Original Label',
    };

    mockUseFindOneAgentQuery.mockReturnValue({
      data: {
        findOneAgent: mockAgent,
      },
    });

    renderHook(() => useUpdateAgentLabel('agent-123'));

    expect(mockUseFindOneAgentQuery).toHaveBeenCalledWith({
      variables: { id: 'agent-123' },
      skip: false,
    });
  });

  it('should update agent label when agent is defined', async () => {
    const mockAgent = {
      id: 'agent-123',
      label: 'Original Label',
    };

    mockUseFindOneAgentQuery.mockReturnValue({
      data: {
        findOneAgent: mockAgent,
      },
    });

    mockUpdateAgent.mockResolvedValue({});

    const { result } = renderHook(() => useUpdateAgentLabel('agent-123'));

    await result.current.updateAgentLabel('New Label');

    expect(mockUpdateAgent).toHaveBeenCalledWith({
      variables: {
        input: {
          id: 'agent-123',
          label: 'New Label',
        },
      },
      refetchQueries: ['FindOneAgent'],
    });
  });

  it('should not update agent label when agent is undefined', async () => {
    mockUseFindOneAgentQuery.mockReturnValue({
      data: {
        findOneAgent: undefined,
      },
    });

    const { result } = renderHook(() => useUpdateAgentLabel('agent-123'));

    await result.current.updateAgentLabel('New Label');

    expect(mockUpdateAgent).not.toHaveBeenCalled();
  });
});
