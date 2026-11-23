import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { type AiModelTier } from 'twenty-shared/ai';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { billingState } from '@/client-config/states/billingState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { SettingsPrivacy } from '@/settings/privacy/components/SettingsPrivacy';
import {
  type ClientAiModelConfig,
  FindManyAgentsDocument,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const EU_ZERO_DATA_RETENTION_MODEL: ClientAiModelConfig = {
  modelId: 'amazon-bedrock-eu/claude',
  label: 'Claude (Bedrock EU)',
  sdkPackage: null,
  dataResidency: 'eu',
  zeroDataRetention: true,
};

const buildAgent = ({
  label,
  modelId,
}: {
  label: string;
  modelId: string;
}) => ({
  __typename: 'Agent',
  id: label,
  name: label,
  label,
  description: null,
  icon: null,
  prompt: 'Answer.',
  modelId,
  responseFormat: null,
  roleId: null,
  isSystem: false,
  isActive: true,
  modelConfiguration: null,
  triggers: null,
  applicationId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const renderSettingsPrivacy = ({
  isMultiWorkspaceEnabled,
  aiModels,
  aiDataPolicy = null,
  pinnedModelIdByTier,
  updateWorkspaceError,
  onUpdateWorkspace,
  updateWorkspaceDelay = 50,
}: {
  isMultiWorkspaceEnabled: boolean;
  aiModels: ClientAiModelConfig[];
  aiDataPolicy?: {
    requiredDataResidencyRegion: string | null;
    isZeroDataRetentionRequired: boolean;
    isProductImprovementDataSharingEnabled: boolean;
  } | null;
  pinnedModelIdByTier?: Partial<Record<AiModelTier, string>>;
  updateWorkspaceError?: Error;
  onUpdateWorkspace?: (variables: Record<string, unknown>) => void;
  updateWorkspaceDelay?: number;
}) => {
  const store = createStore();

  store.set(isMultiWorkspaceEnabledState.atom, isMultiWorkspaceEnabled);
  store.set(billingState.atom, {
    isBillingEnabled: isMultiWorkspaceEnabled,
    trialPeriods: [],
  });
  store.set(aiModelsState.atom, aiModels);
  store.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    aiDataPolicy,
    ...(isDefined(pinnedModelIdByTier)
      ? {
          isAutoModelSelectionEnabled: false,
          aiModelIdByTier: pinnedModelIdByTier,
        }
      : {}),
  });

  return render(
    <Provider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: FindManyAgentsDocument },
            result: {
              data: {
                findManyAgents: [
                  buildAgent({ label: 'Sales agent', modelId: 'openai/gpt' }),
                  buildAgent({
                    label: 'Allowed agent',
                    modelId: EU_ZERO_DATA_RETENTION_MODEL.modelId,
                  }),
                  buildAgent({
                    label: 'Allowed effort agent',
                    modelId: `${EU_ZERO_DATA_RETENTION_MODEL.modelId}@high`,
                  }),
                ],
              },
            },
          },
          {
            request: {
              query: UpdateWorkspaceDocument,
              variables: (variables: Record<string, unknown>) => {
                onUpdateWorkspace?.(variables);

                return true;
              },
            },
            maxUsageCount: 2,
            error: updateWorkspaceError,
            result: {
              data: {
                updateWorkspace: {
                  ...mockCurrentWorkspace,
                  __typename: 'Workspace',
                },
              },
            },
            delay: updateWorkspaceDelay,
          },
        ]}
      >
        <MemoryRouter>
          <I18nProvider i18n={i18n}>
            <ToastProvider>
              <SettingsPrivacy />
            </ToastProvider>
          </I18nProvider>
        </MemoryRouter>
      </MockedProvider>
    </Provider>,
  );
};

describe('SettingsPrivacy', () => {
  beforeAll(() => {
    // jsdom has no PointerEvent, which the switch dispatches on click
    window.PointerEvent ??= MouseEvent as typeof PointerEvent;
  });

  it('presents compliance, AI controls and sharing on Twenty Cloud', () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
    });

    expect(screen.getByText('Data Processing Agreement')).toBeInTheDocument();
    expect(screen.getByText('Processing region')).toBeInTheDocument();
    expect(screen.getByText('Zero data retention')).toBeInTheDocument();
    expect(screen.getByText('Help improve Twenty')).toBeInTheDocument();
    expect(screen.getByText('Allow Support Team Access')).toBeInTheDocument();
    expect(screen.getByText('AWS, Frankfurt, Germany')).toBeInTheDocument();
    expect(
      screen.queryByText('Your data stays in the EU'),
    ).not.toBeInTheDocument();
  });

  it('only shows the AI controls on a self-hosted instance', () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: false,
      aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
    });

    expect(screen.getByText('Processing region')).toBeInTheDocument();
    expect(
      screen.queryByText('How your data is protected'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Data Processing Agreement'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Help improve Twenty')).not.toBeInTheDocument();
  });

  it('hides AI controls when no model states a residency or retention', () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [
        {
          ...EU_ZERO_DATA_RETENTION_MODEL,
          dataResidency: null,
          zeroDataRetention: null,
        },
      ],
    });

    expect(screen.queryByText('Processing region')).not.toBeInTheDocument();
    expect(screen.queryByText('Zero data retention')).not.toBeInTheDocument();
  });

  it('links the agents and pinned tiers a policy in force excludes', async () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
      aiDataPolicy: {
        requiredDataResidencyRegion: 'eu',
        isZeroDataRetentionRequired: true,
        isProductImprovementDataSharingEnabled: true,
      },
      pinnedModelIdByTier: { smart: 'openai/gpt' },
    });

    const agentLink = await screen.findByRole('link', { name: 'Sales agent' });

    expect(agentLink).toHaveAttribute('href', getCoreAgentLink('Sales agent'));
    expect(screen.getByRole('link', { name: 'Smart' })).toHaveAttribute(
      'href',
      `${getSettingsPath(SettingsPath.AI)}#${SETTINGS_AI_TABS.TABS_IDS.MODELS}`,
    );
    expect(screen.getByText('Will fail')).toBeInTheDocument();
    expect(screen.getByText('Falls back')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Allowed agent' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the controls enabled while a save runs', async () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
      aiDataPolicy: {
        requiredDataResidencyRegion: null,
        isZeroDataRetentionRequired: false,
        isProductImprovementDataSharingEnabled: true,
      },
      updateWorkspaceDelay: Number.POSITIVE_INFINITY,
    });

    const zeroDataRetentionSwitch = screen.getByRole('switch', {
      name: 'Zero data retention',
    });

    await userEvent.click(zeroDataRetentionSwitch);

    expect(zeroDataRetentionSwitch).toBeChecked();
    expect(zeroDataRetentionSwitch).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('restores the value when a save fails', async () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
      aiDataPolicy: {
        requiredDataResidencyRegion: null,
        isZeroDataRetentionRequired: false,
        isProductImprovementDataSharingEnabled: true,
      },
      updateWorkspaceError: new Error('Save failed'),
    });

    const zeroDataRetentionSwitch = screen.getByRole('switch', {
      name: 'Zero data retention',
    });

    await userEvent.click(zeroDataRetentionSwitch);

    await waitFor(() => expect(zeroDataRetentionSwitch).not.toBeChecked());
  });

  it('holds a change made during a save until that save lands', async () => {
    const onUpdateWorkspace = jest.fn();

    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
      aiDataPolicy: {
        requiredDataResidencyRegion: null,
        isZeroDataRetentionRequired: false,
        isProductImprovementDataSharingEnabled: true,
      },
      onUpdateWorkspace,
      updateWorkspaceDelay: 500,
    });

    await userEvent.click(
      screen.getByRole('switch', { name: 'Zero data retention' }),
    );
    await userEvent.click(
      screen.getByRole('switch', { name: 'Help improve Twenty' }),
    );

    expect(onUpdateWorkspace).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(onUpdateWorkspace).toHaveBeenCalledTimes(2));

    expect(onUpdateWorkspace).toHaveBeenLastCalledWith({
      input: {
        aiDataPolicy: {
          requiredDataResidencyRegion: null,
          isZeroDataRetentionRequired: true,
          isProductImprovementDataSharingEnabled: false,
        },
      },
    });
  });
});
