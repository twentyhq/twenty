import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useCoreAgents } from '@/object-core/agents/hooks/useCoreAgents';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';

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
  isCustom: true,
  isSystem,
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

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MockedProvider mocks={[FIND_MANY_AGENTS_MOCK]}>{children}</MockedProvider>
  </JotaiProvider>
);

const renderCoreAgents = ({
  shouldClearFilters,
}: {
  shouldClearFilters: boolean;
}) => {
  localStorage.clear();
  resetJotaiStore();

  if (shouldClearFilters) {
    jotaiStore.set(coreAgentsFilterSettingsState.atom, {});
  }

  return renderHook(() => useCoreAgents({ tableId: 'core-agents-test' }), {
    wrapper: Wrapper,
  });
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
});
