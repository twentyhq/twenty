import { MockedProvider } from '@apollo/client/testing/react';
import { CoreAgentDataAccessScope } from '@/object-core/agents/components/CoreAgentDataAccessScope';
import { CoreAgentRolePolicy } from '@/object-core/agents/components/CoreAgentRolePolicy';
import { CORE_AGENT_STORY_AGENT } from '@/object-core/agents/components/__stories__/coreAgentStoryAgent';
import { useDiscardCoreAgentChanges } from '@/object-core/agents/hooks/useDiscardCoreAgentChanges';
import { Provider } from 'jotai';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';

import { createCoreAgentPermissionsStoryStore } from '@/object-core/agents/components/__stories__/createCoreAgentPermissionsStoryStore';

const AGENT_ID = CORE_AGENT_STORY_AGENT.id;

const CoreAgentDataAccessStoryContent = () => {
  const { discardCoreAgentChanges } = useDiscardCoreAgentChanges({
    agentId: AGENT_ID,
  });

  return (
    <Section.Root>
      <CoreAgentRolePolicy agentId={AGENT_ID} />
      <CoreAgentDataAccessScope
        agentId={AGENT_ID}
        title="All objects"
        scope={{ type: 'global' }}
      />
      <CoreAgentDataAccessScope
        agentId={AGENT_ID}
        title="Companies"
        scope={{ type: 'object', objectMetadataId: 'company' }}
      />
      <Button variant="outline" onClick={() => discardCoreAgentChanges()}>
        Discard settings
      </Button>
    </Section.Root>
  );
};

type CoreAgentDataAccessExampleProps = {
  mode?: 'exclusive' | 'shared' | 'read-only' | 'loading' | 'no-role';
};

export const CoreAgentDataAccessExample = ({
  mode = 'exclusive',
}: CoreAgentDataAccessExampleProps) => {
  const [store] = useState(
    () => createCoreAgentPermissionsStoryStore({ mode }).store,
  );

  return (
    <Provider store={store}>
      <MockedProvider>
        <MemoryRouter>
          <CoreAgentDataAccessStoryContent />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
};
