import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { aiModelsState } from '@/client-config/states/aiModelsState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsPrivacy } from '@/settings/privacy/components/SettingsPrivacy';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

const EU_ZDR_MODEL: ClientAiModelConfig = {
  modelId: 'amazon-bedrock-eu/claude',
  label: 'Claude (Bedrock EU)',
  sdkPackage: null,
  dataResidency: 'eu',
  zeroDataRetention: true,
};

const renderSettingsPrivacy = ({
  isMultiWorkspaceEnabled,
  aiModels,
}: {
  isMultiWorkspaceEnabled: boolean;
  aiModels: ClientAiModelConfig[];
}) => {
  const store = createStore();

  store.set(isMultiWorkspaceEnabledState.atom, isMultiWorkspaceEnabled);
  store.set(aiModelsState.atom, aiModels);

  return render(
    <Provider store={store}>
      <MockedProvider>
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
  it('presents hosting, compliance and AI controls on cloud', () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [EU_ZDR_MODEL],
    });

    expect(screen.getByText('Your data stays in the EU')).toBeInTheDocument();
    expect(screen.getByText('Data Processing Agreement')).toBeInTheDocument();
    expect(screen.getByText('Subprocessors')).toBeInTheDocument();
    expect(screen.getByText('Processing region')).toBeInTheDocument();
    expect(screen.getByText('Zero data retention')).toBeInTheDocument();
  });

  it('only shows the AI controls on a self-hosted instance', () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: false,
      aiModels: [EU_ZDR_MODEL],
    });

    expect(screen.getByText('Processing region')).toBeInTheDocument();
    expect(
      screen.queryByText('Your data stays in the EU'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Data Processing Agreement'),
    ).not.toBeInTheDocument();
  });

  it('hides AI controls when no model states a residency or retention', () => {
    renderSettingsPrivacy({
      isMultiWorkspaceEnabled: true,
      aiModels: [
        { ...EU_ZDR_MODEL, dataResidency: null, zeroDataRetention: null },
      ],
    });

    expect(screen.queryByText('Processing region')).not.toBeInTheDocument();
    expect(screen.queryByText('Zero data retention')).not.toBeInTheDocument();
  });
});
