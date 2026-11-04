import { MockedProvider } from '@apollo/client/testing/react';
import { type MockedResponse } from '@apollo/client/testing';
import { useApolloClient } from '@apollo/client/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useCoreAgents } from '@/object-core/agents/hooks/useCoreAgents';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FindManyAgentsDocument,
  type FindManyAgentsQuery,
} from '~/generated-metadata/graphql';

const buildAgent = ({
  id,
  label,
  isSystem,
  updatedAt,
}: {
  id: string;
  label: string;
  isSystem: boolean;
  updatedAt: string;
}) => ({
  __typename: 'Agent' as const,
  id,
  name: label.toLowerCase().replace(/\s/g, ''),
  label,
  description: null,
  icon: null,
  prompt: 'Prompt',
  modelId: 'workspace-default-model',
  responseFormat: null,
  roleId: null,
  isSystem,
  isActive: true,
  modelConfiguration: null,
  triggers: [],
  applicationId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt,
});

const FIND_MANY_AGENTS_MOCK = {
  request: { query: FindManyAgentsDocument },
  result: {
    data: {
      findManyAgents: [
        buildAgent({
          id: 'lead-qualifier',
          label: 'Lead qualifier',
          isSystem: false,
          updatedAt: '2026-01-02T00:00:00.000Z',
        }),
        buildAgent({
          id: 'workflow-agent',
          label: 'Workflow Agent 74d6',
          isSystem: true,
          updatedAt: '2026-01-03T00:00:00.000Z',
        }),
      ],
    },
  },
};

const FIND_MANY_AGENTS_FAILURE_MOCK = {
  request: { query: FindManyAgentsDocument },
  error: new Error('Network unavailable'),
};

const renderCoreAgents = ({
  shouldClearFilters,
  apolloMocks = [FIND_MANY_AGENTS_MOCK],
}: {
  shouldClearFilters: boolean;
  apolloMocks?: MockedResponse<FindManyAgentsQuery>[];
}) => {
  localStorage.clear();
  resetJotaiStore();

  if (shouldClearFilters) {
    jotaiStore.set(coreAgentsFilterSettingsState.atom, {});
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={jotaiStore}>
      <MockedProvider mocks={apolloMocks}>{children}</MockedProvider>
    </JotaiProvider>
  );

  return renderHook(
    () => ({
      ...useCoreAgents({ tableId: 'core-agents-test' }),
      apolloClient: useApolloClient(),
    }),
    {
      wrapper,
    },
  );
};

describe('useCoreAgents', () => {
  it('leaves system agents out by default', async () => {
    const { result } = renderCoreAgents({ shouldClearFilters: false });

    await waitFor(() => expect(result.current.isInitialLoading).toBe(false));

    expect(result.current.coreAgents.map(({ label }) => label)).toEqual([
      'Lead qualifier',
    ]);
  });

  it('lists system agents once the system filter is removed, most recently updated first', async () => {
    const { result } = renderCoreAgents({ shouldClearFilters: true });

    await waitFor(() => expect(result.current.isInitialLoading).toBe(false));

    expect(result.current.coreAgents.map(({ label }) => label)).toEqual([
      'Workflow Agent 74d6',
      'Lead qualifier',
    ]);
  });

  it('retains the loaded list while exposing a background refresh error', async () => {
    const { result } = renderCoreAgents({
      shouldClearFilters: false,
      apolloMocks: [FIND_MANY_AGENTS_MOCK, FIND_MANY_AGENTS_FAILURE_MOCK],
    });
    await waitFor(() => expect(result.current.isInitialLoading).toBe(false));

    await act(async () => {
      await expect(
        result.current.apolloClient.refetchQueries({
          include: [FindManyAgentsDocument],
        }),
      ).rejects.toThrow('Network unavailable');
    });

    expect(result.current.coreAgents.map(({ label }) => label)).toEqual([
      'Lead qualifier',
    ]);
    expect(result.current.hasLoadedData).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('exposes an initial load error without claiming there is a saved list', async () => {
    const { result } = renderCoreAgents({
      shouldClearFilters: false,
      apolloMocks: [FIND_MANY_AGENTS_FAILURE_MOCK],
    });
    await waitFor(() => expect(result.current.isInitialLoading).toBe(false));

    expect(result.current.hasLoadedData).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
