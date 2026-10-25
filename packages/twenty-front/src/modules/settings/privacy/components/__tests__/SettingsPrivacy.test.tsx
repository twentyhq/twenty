import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { aiModelsState } from '@/client-config/states/aiModelsState';
import { billingState } from '@/client-config/states/billingState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsPrivacy } from '@/settings/privacy/components/SettingsPrivacy';
import {
  type ClientAiModelConfig,
  RequestCountryCodeDocument,
} from '~/generated-metadata/graphql';

const EU_ZERO_DATA_RETENTION_MODEL: ClientAiModelConfig = {
  modelId: 'amazon-bedrock-eu/claude',
  label: 'Claude (Bedrock EU)',
  sdkPackage: null,
  dataResidency: 'eu',
  zeroDataRetention: true,
};

const renderSettingsPrivacy = ({
  isMultiWorkspaceEnabled,
  aiModels,
  requestCountryCode = 'FR',
}: {
  isMultiWorkspaceEnabled: boolean;
  aiModels: ClientAiModelConfig[];
  requestCountryCode?: string | null;
}) => {
  const store = createStore();

  store.set(isMultiWorkspaceEnabledState.atom, isMultiWorkspaceEnabled);
  store.set(billingState.atom, {
    isBillingEnabled: isMultiWorkspaceEnabled,
    trialPeriods: [],
  });
  store.set(aiModelsState.atom, aiModels);

  return render(
    <Provider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: RequestCountryCodeDocument },
            result: { data: { requestCountryCode } },
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
  it('presents EU hosting, compliance and AI controls to European visitors', async () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
    });

    expect(
      await screen.findByText('Your data stays in the EU'),
    ).toBeInTheDocument();
    expect(screen.getByText('Data Processing Agreement')).toBeInTheDocument();
    expect(screen.getByText('Subprocessors')).toBeInTheDocument();
    expect(screen.getByText('Processing region')).toBeInTheDocument();
    expect(screen.getByText('Zero data retention')).toBeInTheDocument();
  });

  it.each(['US', null])(
    'leads with security rather than EU hosting for other visitors (%s)',
    async (requestCountryCode) => {
      renderSettingsPrivacy({
        isMultiWorkspaceEnabled: true,
        aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
        requestCountryCode,
      });

      expect(
        await screen.findByText('Security you can verify'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Your data stays in the EU'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText('Workspaces run on AWS in Frankfurt, Germany'),
      ).toBeInTheDocument();
    },
  );

  it('lets cloud workspaces control support access and product improvement sharing', async () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
    });

    expect(
      await screen.findByText('No training on your data'),
    ).toBeInTheDocument();
    expect(screen.getByText('Allow Support Team Access')).toBeInTheDocument();
    expect(screen.getByText('Help improve Twenty')).toBeInTheDocument();
  });

  it('only shows the AI controls on a self-hosted instance', () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: false,
      aiModels: [EU_ZERO_DATA_RETENTION_MODEL],
    });

    expect(screen.getByText('Processing region')).toBeInTheDocument();
    expect(
      screen.queryByText('Your data stays in the EU'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Data Processing Agreement'),
    ).not.toBeInTheDocument();
  });

  it('hides AI controls when no model states a residency or retention', async () => {
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

    await screen.findByText('Your data stays in the EU');

    expect(screen.queryByText('Processing region')).not.toBeInTheDocument();
    expect(screen.queryByText('Zero data retention')).not.toBeInTheDocument();
  });
});
