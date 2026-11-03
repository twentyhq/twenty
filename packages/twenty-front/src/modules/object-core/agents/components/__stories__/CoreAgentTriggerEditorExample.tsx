import { MockedProvider } from '@apollo/client/testing/react';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreAgentTriggerEditor } from '@/object-core/agents/components/CoreAgentTriggerEditor';
import { CoreAgentTriggersTab } from '@/object-core/agents/components/CoreAgentTriggersTab';
import { CORE_AGENT_STORY_AGENT } from '@/object-core/agents/components/__stories__/coreAgentStoryAgent';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useDiscardCoreAgentChanges } from '@/object-core/agents/hooks/useDiscardCoreAgentChanges';
import { coreAgentEditSessionFamilyState } from '@/object-core/agents/states/coreAgentEditSessionFamilyState';
import { reconcileCoreAgentEditSession } from '@/object-core/agents/utils/reconcileCoreAgentEditSession';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { MemoryRouter } from 'react-router-dom';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const TRIGGER_ID = '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11';
const AGENT_ID = CORE_AGENT_STORY_AGENT.id;

type CoreAgentTriggerEditorStoryContentProps = {
  onSave: (triggers: unknown[]) => void;
};

const CoreAgentTriggerEditorStoryContent = ({
  onSave,
}: CoreAgentTriggerEditorStoryContentProps) => {
  const { session, canSave, isEditable, validationError } =
    useCoreAgentEditStatus({ agentId: AGENT_ID });
  const { discardCoreAgentChanges } = useDiscardCoreAgentChanges({
    agentId: AGENT_ID,
  });

  return (
    <Section.Root>
      <CoreAgentTriggersTab agentId={AGENT_ID} disabled={!isEditable} />
      <CoreAgentTriggerEditor agentId={AGENT_ID} triggerId={TRIGGER_ID} />
      {isDefined(validationError) && (
        <Text role="alert">{validationError}</Text>
      )}
      <Button
        disabled={!canSave}
        onClick={() => onSave(session?.draft.triggers ?? [])}
      >
        Save settings
      </Button>
      <Button variant="outline" onClick={() => discardCoreAgentChanges()}>
        Cancel settings
      </Button>
    </Section.Root>
  );
};

type CoreAgentTriggerEditorExampleProps = {
  onSave: (triggers: unknown[]) => void;
  triggerCount?: number;
  readOnly?: boolean;
};

export const CoreAgentTriggerEditorExample = ({
  onSave,
  triggerCount = 2,
  readOnly = false,
}: CoreAgentTriggerEditorExampleProps) => {
  const [store] = useState(() => {
    const nextStore = createStore();
    const schedule = {
      id: TRIGGER_ID,
      type: 'CRON',
      isActive: false,
      instructions: 'Send the weekly report',
      settings: { pattern: '0 9 * * 1' },
    };
    const opaqueTriggers = Array.from(
      { length: triggerCount - 1 },
      (_, index) => ({
        id: `unsupported-${index}`,
        type: 'WEBHOOK',
        futureSettings: { preserve: true },
      }),
    );
    const agent = {
      ...CORE_AGENT_STORY_AGENT,
      applicationId: mockCurrentWorkspace.workspaceCustomApplication.id,
      triggers: [schedule, ...opaqueTriggers],
    };
    nextStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    nextStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: readOnly ? [] : [PermissionFlagType.AI_SETTINGS],
    });
    nextStore.set(
      coreAgentEditSessionFamilyState.atomFamily(AGENT_ID),
      reconcileCoreAgentEditSession({
        session: undefined,
        agent,
        hasRoleChanges: false,
      }),
    );

    return nextStore;
  });

  return (
    <Provider store={store}>
      <MockedProvider>
        <MemoryRouter>
          <CoreAgentTriggerEditorStoryContent onSave={onSave} />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
};
