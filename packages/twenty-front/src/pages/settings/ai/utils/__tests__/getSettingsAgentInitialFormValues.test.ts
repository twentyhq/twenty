import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { getSettingsAgentInitialFormValues } from '~/pages/settings/ai/utils/getSettingsAgentInitialFormValues';

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
  modelConfiguration: { webSearch: { enabled: true } },
  evaluationInputs: ['Is Acme a good fit?'],
  applicationId: 'application-id',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('getSettingsAgentInitialFormValues', () => {
  it('starts a new agent on the workspace default model with an empty form', () => {
    expect(getSettingsAgentInitialFormValues()).toEqual({
      name: '',
      label: '',
      description: '',
      icon: 'IconLego',
      modelId: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
      role: null,
      prompt: '',
      isCustom: true,
      modelConfiguration: {},
      responseFormat: { type: 'text' },
      evaluationInputs: [],
    });
  });

  it('maps a loaded agent onto the form fields', () => {
    expect(getSettingsAgentInitialFormValues(agent)).toEqual({
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
      evaluationInputs: ['Is Acme a good fit?'],
    });
  });

  it('falls back to the default icon, empty configuration and text format when the agent has none', () => {
    const formValues = getSettingsAgentInitialFormValues({
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
