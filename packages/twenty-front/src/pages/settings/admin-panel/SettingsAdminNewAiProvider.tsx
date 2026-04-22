import { useMemo, useState } from 'react';

import { useMutation, useQuery } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { type AiSdkPackage, isDataResidency } from 'twenty-shared/ai';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconPlus, Info } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

import { AI_ADMIN_PATH } from '@/settings/admin-panel/ai/constants/AiAdminPath';
import { DATA_RESIDENCY_OPTIONS } from '@/settings/admin-panel/ai/constants/DataResidencyOptions';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { ADD_AI_PROVIDER } from '@/settings/admin-panel/ai/graphql/mutations/addAiProvider';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { GET_MODELS_DEV_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getModelsDevProviders';
import { type RawAiProviderConfig } from '@/settings/admin-panel/ai/types/RawAiProviderConfig';
import { slugify } from 'transliteration';
import { getProviderIcon } from '@/settings/admin-panel/ai/utils/getProviderIcon';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

type ModelsDevProvider = { id: string; modelCount: number; npm: AiSdkPackage };

type FormValues = {
  npm: AiSdkPackage;
  label: string;
  apiKey: string;
  baseUrl: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  dataResidency: string;
};

export const SettingsAdminNewAiProvider = () => {
  const apolloAdminClient = useApolloAdminClient();
  const navigate = useNavigate();
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModelsDevId, setSelectedModelsDevId] = useState<string | null>(
    null,
  );
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [addAiProvider] = useMutation(ADD_AI_PROVIDER, {
    client: apolloAdminClient,
  });

  const { data: modelsDevData } = useQuery<{
    getModelsDevProviders: ModelsDevProvider[];
  }>(GET_MODELS_DEV_PROVIDERS, { client: apolloAdminClient });

  const modelsDevProviders = useMemo(
    () => modelsDevData?.getModelsDevProviders ?? [],
    [modelsDevData?.getModelsDevProviders],
  );

  const modelsDevByIdMap = useMemo(
    () =>
      new Map(modelsDevProviders.map((provider) => [provider.id, provider])),
    [modelsDevProviders],
  );

  const providerOptions = useMemo(
    () =>
      modelsDevProviders.map((provider) => ({
        value: provider.id,
        label: `${provider.id.charAt(0).toUpperCase() + provider.id.slice(1)} (${provider.modelCount} models)`,
        Icon: getProviderIcon(provider.id),
      })),
    [modelsDevProviders],
  );

  const form = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: {
      npm: '@ai-sdk/openai-compatible',
      label: '',
      apiKey: '',
      baseUrl: '',
      region: '',
      accessKeyId: '',
      secretAccessKey: '',
      dataResidency: '',
    },
  });

  const hasSelected = selectedModelsDevId !== null || isCustomMode;
  const npmPackage = form.watch('npm');
  const isBedrock = npmPackage === '@ai-sdk/amazon-bedrock';
  const isOpenAiCompatible = npmPackage === '@ai-sdk/openai-compatible';
  const needsApiKey = !isBedrock;
  const isModelsDevWithoutNativeSdk =
    selectedModelsDevId !== null && isOpenAiCompatible;

  const handleProviderSelected = (providerId: string) => {
    setSelectedModelsDevId(providerId);
    setIsCustomMode(false);

    const suggestion = modelsDevByIdMap.get(providerId);

    form.setValue('npm', suggestion?.npm ?? '@ai-sdk/openai-compatible');

    form.setValue(
      'label',
      providerId.charAt(0).toUpperCase() + providerId.slice(1),
    );
  };

  const handleCustomMode = () => {
    setSelectedModelsDevId(null);
    setIsCustomMode(true);
    form.setValue('npm', '@ai-sdk/openai-compatible');
    form.setValue('label', '');
  };

  const handleSave = async () => {
    const values = form.getValues();

    if (!values.label.trim()) {
      form.setError('label', {
        type: 'manual',
        message: t`Label is required`,
      });

      return;
    }

    const providerName = slugify(values.label, { separator: '-' });

    if (!providerName) {
      form.setError('label', {
        type: 'manual',
        message: t`Label must contain at least one alphanumeric character`,
      });

      return;
    }

    const config: Partial<RawAiProviderConfig> = {
      npm: values.npm,
      label: values.label.trim(),
      ...(selectedModelsDevId && { name: selectedModelsDevId }),
      ...(needsApiKey &&
        values.apiKey.trim() && {
          apiKey: values.apiKey.trim(),
        }),
      ...(isOpenAiCompatible &&
        values.baseUrl.trim() && {
          baseUrl: values.baseUrl.trim(),
        }),
      ...(isDataResidency(values.dataResidency) && {
        dataResidency: values.dataResidency,
      }),
    };

    if (isBedrock) {
      if (!values.region.trim()) {
        form.setError('region', {
          type: 'manual',
          message: t`Region is required for Bedrock`,
        });

        return;
      }
      config.region = values.region.trim();

      if (values.accessKeyId.trim()) {
        config.accessKeyId = values.accessKeyId.trim();
      }
      if (values.secretAccessKey.trim()) {
        config.secretAccessKey = values.secretAccessKey.trim();
      }
    }

    if (!isBedrock && !isOpenAiCompatible && !values.apiKey.trim()) {
      form.setError('apiKey', {
        type: 'manual',
        message: t`API key is required`,
      });

      return;
    }

    if (isOpenAiCompatible && !values.baseUrl.trim()) {
      form.setError('baseUrl', {
        type: 'manual',
        message: t`Base URL is required`,
      });

      return;
    }

    setIsSubmitting(true);

    try {
      await addAiProvider({
        variables: {
          providerName,
          providerConfig: config,
        },
        refetchQueries: [
          { query: GET_AI_PROVIDERS },
          { query: GET_ADMIN_AI_MODELS },
        ],
      });

      enqueueSuccessSnackBar({
        message: t`Provider "${values.label.trim()}" added`,
      });
      navigate(AI_ADMIN_PATH);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to add provider`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSave)}>
      <SubMenuTopBarContainer
        title={t`New AI Provider`}
        links={[
          {
            children: <Trans>Admin Panel</Trans>,
            href: getSettingsPath(SettingsPath.AdminPanel),
          },
          { children: <Trans>New AI Provider</Trans> },
        ]}
        actionButton={
          <SaveAndCancelButtons
            onCancel={() => navigate(AI_ADMIN_PATH)}
            isSaveDisabled={isSubmitting || !hasSelected}
            onSave={handleSave}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
              title={t`Provider`}
              description={t`Select a known provider or create a custom one`}
            />
            <Select
              dropdownId="ai-provider-models-dev-select"
              value={selectedModelsDevId ?? undefined}
              onChange={handleProviderSelected}
              options={providerOptions}
              withSearchInput
              fullWidth
              callToActionButton={{
                text: t`Custom provider`,
                onClick: handleCustomMode,
                Icon: IconPlus,
              }}
            />
          </Section>

          {isModelsDevWithoutNativeSdk && (
            <Info
              accent="blue"
              text={t`This provider doesn't have a native SDK yet — it will use OpenAI-compatible mode. Need native support? Reach out to us.`}
            />
          )}

          {hasSelected && (
            <>
              <Section>
                <H2Title
                  title={t`Label`}
                  description={t`A display name for this provider`}
                />
                <Controller
                  name="label"
                  control={form.control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <TextInput
                      value={value}
                      onChange={onChange}
                      placeholder={
                        isCustomMode
                          ? t`e.g. My OpenAI Proxy`
                          : t`e.g. OpenAI EU`
                      }
                      fullWidth
                      error={error?.message}
                    />
                  )}
                />
              </Section>

              {needsApiKey && (
                <Section>
                  <H2Title
                    title={t`API Key`}
                    description={t`Your provider API key for authentication`}
                  />
                  <Controller
                    name="apiKey"
                    control={form.control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <TextInput
                        value={value}
                        onChange={onChange}
                        placeholder={t`sk-...`}
                        fullWidth
                        type="password"
                        error={error?.message}
                      />
                    )}
                  />
                </Section>
              )}

              {isOpenAiCompatible && (
                <Section>
                  <H2Title
                    title={t`Base URL`}
                    description={t`The API endpoint for your OpenAI-compatible provider`}
                  />
                  <Controller
                    name="baseUrl"
                    control={form.control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <TextInput
                        value={value}
                        onChange={onChange}
                        placeholder={t`https://api.example.com/v1`}
                        fullWidth
                        error={error?.message}
                      />
                    )}
                  />
                </Section>
              )}

              <Section>
                <H2Title
                  title={t`Data Residency`}
                  description={t`Region where inference data is processed (optional)`}
                />
                <Controller
                  name="dataResidency"
                  control={form.control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      dropdownId="ai-provider-data-residency-select"
                      value={value}
                      onChange={onChange}
                      options={[
                        { value: '', label: t`None` },
                        ...DATA_RESIDENCY_OPTIONS,
                      ]}
                      fullWidth
                    />
                  )}
                />
              </Section>

              {isBedrock && (
                <>
                  <Section>
                    <H2Title
                      title={t`Region`}
                      description={t`The AWS region for Bedrock`}
                    />
                    <Controller
                      name="region"
                      control={form.control}
                      render={({
                        field: { onChange, value },
                        fieldState: { error },
                      }) => (
                        <TextInput
                          value={value}
                          onChange={onChange}
                          placeholder={t`us-east-1`}
                          fullWidth
                          error={error?.message}
                        />
                      )}
                    />
                  </Section>

                  <Section>
                    <H2Title
                      title={t`Access Key ID`}
                      description={t`Optional — uses IAM role if empty`}
                    />
                    <Controller
                      name="accessKeyId"
                      control={form.control}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          value={value}
                          onChange={onChange}
                          placeholder={t`AKIA...`}
                          fullWidth
                        />
                      )}
                    />
                  </Section>

                  <Section>
                    <H2Title
                      title={t`Secret Access Key`}
                      description={t`Optional — uses IAM role if empty`}
                    />
                    <Controller
                      name="secretAccessKey"
                      control={form.control}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          value={value}
                          onChange={onChange}
                          fullWidth
                          type="password"
                        />
                      )}
                    />
                  </Section>
                </>
              )}
            </>
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </form>
  );
};
