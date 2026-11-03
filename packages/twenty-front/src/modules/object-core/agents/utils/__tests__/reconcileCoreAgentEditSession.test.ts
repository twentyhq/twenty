import { isCoreAgentRoleEditable } from '@/object-core/agents/utils/isCoreAgentRoleEditable';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { reconcileCoreAgentEditSession } from '@/object-core/agents/utils/reconcileCoreAgentEditSession';

const AGENT: CoreAgent = {
  __typename: 'Agent',
  id: 'agent-id',
  name: 'agent',
  label: 'Agent',
  description: 'Original description',
  icon: null,
  prompt: 'Original instructions',
  modelId: 'workspace-default-model',
  responseFormat: null,
  roleId: null,
  isSystem: false,
  isActive: true,
  modelConfiguration: {},
  triggers: [{ type: 'FUTURE_TRIGGER', settings: { value: 1 } }],
  applicationId: 'custom-application',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const session = reconcileCoreAgentEditSession({
  session: undefined,
  agent: AGENT,
  hasRoleChanges: false,
});

describe('reconcileCoreAgentEditSession', () => {
  it('accepts untouched remote fields while retaining local edits and opaque triggers', () => {
    const current = {
      ...session,
      draft: { ...session.draft, prompt: 'Local instructions' },
    };
    const remote = {
      ...AGENT,
      description: 'Remote description',
      prompt: 'Remote instructions',
      label: 'Renamed agent',
    };
    const result = reconcileCoreAgentEditSession({
      session: current,
      agent: remote,
      hasRoleChanges: false,
    });

    expect(result.draft).toEqual({
      ...session.draft,
      prompt: 'Local instructions',
      description: 'Remote description',
    });
    expect(result.confirmed.prompt).toBe('Remote instructions');
    expect(result.agent.label).toBe('Renamed agent');
    expect(result.draft).not.toHaveProperty('label');
    expect(result.draft).not.toHaveProperty('avatarColor');
  });

  it('acknowledges saved settings without clearing later edits or the shared save lock', () => {
    const current = {
      ...session,
      isSaving: true,
      draft: {
        ...session.draft,
        prompt: 'Newer instructions',
        description: 'Submitted description',
      },
    };
    const result = reconcileCoreAgentEditSession({
      session: current,
      agent: {
        ...AGENT,
        prompt: 'Submitted instructions',
        description: 'Submitted description',
      },
      hasRoleChanges: false,
    });

    expect(result.draft.prompt).toBe('Newer instructions');
    expect(result.draft.description).toBe(result.confirmed.description);
    expect(result.isSaving).toBe(true);
  });

  it('preserves a newer edit that restores the pre-save value', () => {
    const submitted = { ...session.draft, prompt: 'Submitted instructions' };
    const current = {
      ...session,
      isSaving: true,
      draft: session.draft,
      fieldRevisions: { ...session.fieldRevisions, prompt: 2 },
      submission: {
        settings: submitted,
        fieldRevisions: { ...session.fieldRevisions, prompt: 1 },
      },
    };
    const result = reconcileCoreAgentEditSession({
      session: current,
      agent: {
        ...AGENT,
        prompt: submitted.prompt,
        description: 'Remote description',
      },
      hasRoleChanges: false,
    });

    expect(result.draft.prompt).toBe(AGENT.prompt);
    expect(result.confirmed.prompt).toBe(submitted.prompt);
    expect(result.draft.description).toBe('Remote description');
    const refreshed = reconcileCoreAgentEditSession({
      session: result,
      agent: {
        ...AGENT,
        prompt: submitted.prompt,
        description: 'Latest remote description',
      },
      hasRoleChanges: false,
    });
    expect(refreshed.draft.description).toBe('Latest remote description');
  });

  it('keeps a touched role draft attached to its role when a remote assignment changes', () => {
    const current = { ...session, roleId: 'original-role' };
    const agent = { ...AGENT, roleId: 'remote-role' };

    expect(
      reconcileCoreAgentEditSession({
        session: current,
        agent,
        hasRoleChanges: true,
      }).roleId,
    ).toBe('original-role');
    expect(
      reconcileCoreAgentEditSession({
        session: current,
        agent,
        hasRoleChanges: false,
      }).roleId,
    ).toBe('remote-role');
  });
});

it.each(['canBeAssignedToUsers', 'canBeAssignedToApiKeys'] as const)(
  'refuses a role that supports %s even when it has only this agent assigned',
  (capability) => {
    const role = {
      ...DEFAULT_SETTINGS_DRAFT_ROLE,
      id: 'role-id',
      applicationId: 'custom-application',
      isEditable: true,
      canBeAssignedToAgents: true,
      agents: [AGENT],
    };
    const context = {
      role,
      agentId: AGENT.id,
      workspaceCustomApplicationId: 'custom-application',
    };

    expect(isCoreAgentRoleEditable(context)).toBe(true);
    expect(
      isCoreAgentRoleEditable({
        ...context,
        role: { ...role, [capability]: true },
      }),
    ).toBe(false);
  },
);
