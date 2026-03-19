import { useState } from 'react';

import { useMutation } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { AI_ADMIN_PATH } from '@/settings/admin-panel/ai/constants/AiAdminPath';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

import { ADD_AI_PROVIDER } from '@/settings/admin-panel/ai/graphql/mutations/addAiProvider';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { DATA_RESIDENCY_OPTIONS } from '@/settings/admin-panel/ai/constants/DataResidencyOptions';
import { PROVIDER_TYPE_LABELS } from '@/settings/admin-panel/ai/constants/ProviderTypeLabels';
import { getProviderTypeLabel } from '@/settings/admin-panel/ai/utils/getProviderTypeLabel';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

const PROVIDER_TYPE_OPTIONS = Object.entries(PROVIDER_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

type FormValues = {
  type: string;
  name: string;
  apiKey: string;
  baseUrl: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  dataResidency: string;
};

export const SettingsAdminNewAiProvider = () => {
  const navigate = useNavigate();
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addAiProvider] = useMutation(ADD_AI_PROVIDER);

  const form = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: {
      type: 'openai',
      name: '',
      apiKey: '',
      baseUrl: '',
      region: '',
      accessKeyId: '',
      secretAccessKey: '',
      dataResidency: '',
    },
  });

  const providerType = form.watch('type');
  const isBedrock = providerType === 'bedrock';
  const isOpenAICompatible = providerType === 'openai-compatible';
  const needsApiKey = !isBedrock;

  const handleSave = async () => {
    const values = form.getValues();

    if (!values.name.trim()) {
      form.setError('name', {
        type: 'manual',
        message: t`Name is required`,
      });

      return;
    }

    const providerName = values.name.trim();

    const config: Record<string, unknown> = { type: values.type };

    if (needsApiKey && values.apiKey.trim()) {
      config.apiKey = values.apiKey.trim();
    }

    if (isOpenAICompatible && values.baseUrl.trim()) {
      config.baseUrl = values.baseUrl.trim();
    }

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

    if (values.dataResidency) {
      config.dataResidency = values.dataResidency;
    }

    if (!isBedrock && !isOpenAICompatible && !values.apiKey.trim()) {
      form.setError('apiKey', {
        type: 'manual',
        message: t`API key is required`,
      });

      return;
    }

    if (isOpenAICompatible && !values.baseUrl.trim()) {
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
        message: t`Provider "${providerName}" added`,
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
            isSaveDisabled={isSubmitting}
            onSave={handleSave}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
              title={t`Provider`}
              description={t`Select the AI provider type`}
            />
            <Controller
              name="type"
              control={form.control}
              render={({ field: { onChange, value } }) => (
                <Select
                  dropdownId="ai-provider-type-select"
                  value={value}
                  onChange={onChange}
                  options={PROVIDER_TYPE_OPTIONS}
                  fullWidth
                />
              )}
            />
          </Section>

          <Section>
            <H2Title
              title={t`Name`}
              description={t`A unique name for this provider instance`}
            />
            <Controller
              name="name"
              control={form.control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TextInput
                  value={value}
                  onChange={onChange}
                  placeholder={t`e.g. my-openai-proxy`}
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
                    placeholder="sk-..."
                    fullWidth
                    type="password"
                    error={error?.message}
                  />
                )}
              />
            </Section>
          )}

          {isOpenAICompatible && (
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
                    placeholder="https://api.example.com/v1"
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
              description={t`Region where inference data is processed (optional / for display only)`}
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
                      placeholder="us-east-1"
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
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </form>
  );
};
