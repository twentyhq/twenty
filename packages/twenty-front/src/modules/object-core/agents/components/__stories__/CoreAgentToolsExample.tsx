import { MockedProvider } from '@apollo/client/testing/react';
import { CoreAgentToolsPanel } from '@/object-core/agents/components/CoreAgentToolsPanel';
import { CoreAgentToolsSection } from '@/object-core/agents/components/CoreAgentToolsSection';
import { createCoreAgentPermissionsStoryStore } from '@/object-core/agents/components/__stories__/createCoreAgentPermissionsStoryStore';
import { useDiscardCoreAgentChanges } from '@/object-core/agents/hooks/useDiscardCoreAgentChanges';
import { CORE_AGENT_STORY_AGENT } from '@/object-core/agents/components/__stories__/coreAgentStoryAgent';
import { Provider } from 'jotai';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import {
  GetRolesDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const CoreAgentToolsStoryContent = () => {
  const { discardCoreAgentChanges } = useDiscardCoreAgentChanges({
    agentId: CORE_AGENT_STORY_AGENT.id,
  });
  return (
    <Section.Root>
      <CoreAgentToolsSection agentId={CORE_AGENT_STORY_AGENT.id} />
      <CoreAgentToolsPanel agentId={CORE_AGENT_STORY_AGENT.id} />
      <Button variant="outline" onClick={() => void discardCoreAgentChanges()}>
        Discard settings
      </Button>
    </Section.Root>
  );
};

export const CoreAgentToolsExample = () => {
  const [{ store, role, permissionDefinitions }] = useState(() =>
    createCoreAgentPermissionsStoryStore({
      canAccessAllTools: true,
      permissionKeys: [PermissionFlagType.WORKSPACE, 'legacy-setting'],
      permissionDefinitions: [
        {
          __typename: 'PermissionFlag',
          id: 'research-tool',
          applicationId: 'research-application',
          key: 'research-tool',
          label: 'Research company',
          description: 'Look up company background',
          icon: 'IconTool',
          permissionType: 'tool',
        },
      ],
    }),
  );

  return (
    <Provider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetRolesDocument },
            result: {
              data: {
                getRoles: [role],
                getPermissionFlags: permissionDefinitions,
              },
            },
          },
        ]}
      >
        <MemoryRouter>
          <CoreAgentToolsStoryContent />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
};
