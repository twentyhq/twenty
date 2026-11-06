import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { billingState } from '@/client-config/states/billingState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
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
  updateWorkspaceError,
}: {
  isMultiWorkspaceEnabled: boolean;
  aiModels: ClientAiModelConfig[];
  aiDataPolicy?: {
    requiredDataResidencyRegion: string | null;
    isZeroDataRetentionRequired: boolean;
    isProductImprovementDataSharingEnabled: boolean;
  } | null;
  updateWorkspaceError?: Error;
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
            request: { query: UpdateWorkspaceDocument, variables: () => true },
            error: updateWorkspaceError,
            delay: 50,
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

    expect(screen.getByText('Security you can verify')).toBeInTheDocument();
    expect(screen.getByText('Data Processing Agreement')).toBeInTheDocument();
    expect(screen.getByText('Processing region')).toBeInTheDocument();
    expect(screen.getByText('Zero data retention')).toBeInTheDocument();
    expect(screen.getByText('Help improve Twenty')).toBeInTheDocument();
    expect(screen.getByText('Allow Support Team Access')).toBeInTheDocument();
    expect(
      screen.getByText('Workspaces run on AWS in Frankfurt, Germany'),
    ).toBeInTheDocument();
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
      screen.queryByText('Security you can verify'),
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

  it('lists the agents a policy in force excludes', async () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
      aiDataPolicy: {
        requiredDataResidencyRegion: 'eu',
        isZeroDataRetentionRequired: true,
        isProductImprovementDataSharingEnabled: true,
      },
    });

    expect(
      await screen.findByText(/they fail when they run: Sales agent$/),
    ).toBeInTheDocument();
  });

  it('disables the controls during a save and restores the value when it fails', async () => {
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

    expect(zeroDataRetentionSwitch).toBeChecked();
    expect(zeroDataRetentionSwitch).toHaveAttribute('aria-disabled', 'true');

    await waitFor(() => expect(zeroDataRetentionSwitch).not.toBeChecked());

    expect(zeroDataRetentionSwitch).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});
