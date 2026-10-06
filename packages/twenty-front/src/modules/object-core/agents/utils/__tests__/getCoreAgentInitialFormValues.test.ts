import { getCoreAgentInitialFormValues } from '@/object-core/agents/utils/getCoreAgentInitialFormValues';

const agent = {
  __typename: 'Agent' as const,
  id: 'agent-id',
  name: 'salesAssistant',
  label: 'Sales assistant',
  description: 'Qualifies leads',
  icon: 'IconRobot',
  prompt: 'You qualify leads.',
  modelId: 'anthropic/claude-sonnet-5',
  responseFormat: { type: 'json', schema: {} },
  roleId: 'role-id',
  isCustom: true,
  isSystem: false,
  modelConfiguration: { webSearch: { enabled: true } },
  triggers: [
    {
      id: '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11',
      type: 'CRON',
      isActive: true,
      instructions: 'Send the weekly digest',
      settings: { pattern: '0 9 * * 1' },
    },
  ],
  applicationId: 'application-id',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('getCoreAgentInitialFormValues', () => {
  it('maps a loaded agent onto the form fields', () => {
    expect(getCoreAgentInitialFormValues(agent)).toEqual({
      name: 'salesAssistant',
      label: 'Sales assistant',
      description: 'Qualifies leads',
      icon: 'IconRobot',
      modelId: 'anthropic/claude-sonnet-5',
      role: 'role-id',
      prompt: 'You qualify leads.',
      isCustom: true,
      modelConfiguration: { webSearch: { enabled: true } },
      responseFormat: { type: 'json', schema: {} },
      triggers: [
        {
          id: '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11',
          type: 'CRON',
          isActive: true,
          instructions: 'Send the weekly digest',
          settings: { pattern: '0 9 * * 1' },
        },
      ],
    });
  });

  it('falls back to the default icon, empty configuration and text format when the agent has none', () => {
    const formValues = getCoreAgentInitialFormValues({
      ...agent,
      icon: null,
      modelConfiguration: null,
      responseFormat: null,
    });

    expect(formValues.icon).toBe('IconLego');
    expect(formValues.modelConfiguration).toEqual({});
    expect(formValues.responseFormat).toEqual({ type: 'text' });
  });
});
