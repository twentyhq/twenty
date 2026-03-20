import { useMemo, useState } from 'react';

import { useMutation, useQuery } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

import { ADD_MODEL_TO_PROVIDER } from '@/settings/admin-panel/ai/graphql/mutations/addModelToProvider';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { GET_MODELS_DEV_SUGGESTIONS } from '@/settings/admin-panel/ai/graphql/queries/getModelsDevSuggestions';
import { type GetAiProvidersResult } from '@/settings/admin-panel/ai/types/GetAiProvidersResult';
import { type RawAiProviderConfig } from '@/settings/admin-panel/ai/types/RawAiProviderConfig';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Toggle } from 'twenty-ui/input';

type ModelSuggestion = {
  modelId: string;
  name: string;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  contextWindowTokens: number;
  maxOutputTokens: number;
  doesSupportThinking: boolean;
};

type FormValues = {
  rawModelId: string;
  label: string;
  inputCostPerMillionTokens: string;
  outputCostPerMillionTokens: string;
  contextWindowTokens: string;
  maxOutputTokens: string;
  doesSupportThinking: boolean;
};

export const SettingsAdminNewAiModel = () => {
  const { providerName } = useParams<{ providerName: string }>();
  const navigate = useNavigate();
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: providersData } =
    useQuery<GetAiProvidersResult>(GET_AI_PROVIDERS);

  const provider = useMemo(() => {
    if (!providerName || !providersData?.getAiProviders) {
      return undefined;
    }

    const rawProviders = providersData.getAiProviders as Record<
      string,
      RawAiProviderConfig
    >;

    return rawProviders[providerName];
  }, [providerName, providersData]);

  const providerType = provider?.name ?? '';

  const { data: suggestionsData } = useQuery<{
    getModelsDevSuggestions: ModelSuggestion[];
  }>(GET_MODELS_DEV_SUGGESTIONS, {
    variables: { providerType },
    skip: !providerType,
  });

  const suggestions = suggestionsData?.getModelsDevSuggestions ?? [];

  const suggestionsByModelId = useMemo(() => {
    const map = new Map<string, ModelSuggestion>();

    for (const suggestion of suggestions) {
      map.set(suggestion.modelId, suggestion);
    }

    return map;
  }, [suggestions]);

  const modelIdOptions = useMemo(
    () =>
      suggestions.map((suggestion) => ({
        value: suggestion.modelId,
        label: `${suggestion.name} (${suggestion.modelId})`,
      })),
    [suggestions],
  );

  const [addModelToProvider] = useMutation(ADD_MODEL_TO_PROVIDER);

  const form = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: {
      rawModelId: '',
      label: '',
      inputCostPerMillionTokens: '',
      outputCostPerMillionTokens: '',
      contextWindowTokens: '',
      maxOutputTokens: '',
      doesSupportThinking: false,
    },
  });

  const providerDetailPath = providerName
    ? getSettingsPath(SettingsPath.AdminPanelAiProviderDetail, {
        providerName,
      })
    : getSettingsPath(SettingsPath.AdminPanel);

  const handleModelIdSelected = (modelId: string) => {
    form.setValue('rawModelId', modelId);
    const suggestion = suggestionsByModelId.get(modelId);

    if (isDefined(suggestion)) {
      form.setValue('label', suggestion.name);
      form.setValue(
        'inputCostPerMillionTokens',
        String(suggestion.inputCostPerMillionTokens),
      );
      form.setValue(
        'outputCostPerMillionTokens',
        String(suggestion.outputCostPerMillionTokens),
      );
      form.setValue(
        'contextWindowTokens',
        String(suggestion.contextWindowTokens),
      );
      form.setValue('maxOutputTokens', String(suggestion.maxOutputTokens));
      form.setValue('doesSupportThinking', suggestion.doesSupportThinking);
    }
  };

  const handleSave = async () => {
    const values = form.getValues();

    if (!values.rawModelId.trim()) {
      form.setError('rawModelId', {
        type: 'manual',
        message: t`Model ID is required`,
      });

      return;
    }

    if (!values.label.trim()) {
      form.setError('label', {
        type: 'manual',
        message: t`Label is required`,
      });

      return;
    }

    const modelConfig = {
      rawModelId: values.rawModelId.trim(),
      label: values.label.trim(),
      inputCostPerMillionTokens: parseFloat(
        values.inputCostPerMillionTokens || '0',
      ),
      outputCostPerMillionTokens: parseFloat(
        values.outputCostPerMillionTokens || '0',
      ),
      contextWindowTokens: parseInt(values.contextWindowTokens || '0', 10),
      maxOutputTokens: parseInt(values.maxOutputTokens || '0', 10),
      doesSupportThinking: values.doesSupportThinking,
    };

    setIsSubmitting(true);

    try {
      await addModelToProvider({
        variables: {
          providerName,
          modelConfig,
        },
        refetchQueries: [
          { query: GET_AI_PROVIDERS },
          { query: GET_ADMIN_AI_MODELS },
        ],
      });

      enqueueSuccessSnackBar({
        message: t`Model "${values.label.trim()}" added`,
      });
      navigate(providerDetailPath);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to add model`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSuggestions = modelIdOptions.length > 0;

  return (
    <form onSubmit={form.handleSubmit(handleSave)}>
      <SubMenuTopBarContainer
        title={t`New Model`}
        links={[
          {
            children: <Trans>Admin Panel</Trans>,
            href: getSettingsPath(SettingsPath.AdminPanel),
          },
          {
            children: provider?.label ?? providerName ?? '',
            href: providerDetailPath,
          },
          { children: <Trans>New Model</Trans> },
        ]}
        actionButton={
          <SaveAndCancelButtons
            onCancel={() => navigate(providerDetailPath)}
            isSaveDisabled={isSubmitting}
            onSave={handleSave}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
              title={t`Model ID`}
              description={
                hasSuggestions
                  ? t`Select from known models or type a custom ID`
                  : t`The model identifier used by the provider API`
              }
            />
            {hasSuggestions ? (
              <Controller
                name="rawModelId"
                control={form.control}
                render={({ field: { value } }) => (
                  <Select
                    dropdownId="ai-model-id-select"
                    value={value || undefined}
                    onChange={handleModelIdSelected}
                    options={modelIdOptions}
                    withSearchInput
                    fullWidth
                  />
                )}
              />
            ) : (
              <Controller
                name="rawModelId"
                control={form.control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextInput
                    value={value}
                    onChange={onChange}
                    placeholder={t`e.g. gpt-4o`}
                    fullWidth
                    error={error?.message}
                  />
                )}
              />
            )}
          </Section>

          <Section>
            <H2Title
              title={t`Label`}
              description={t`Display name for the model`}
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
                  placeholder={t`e.g. GPT-4o`}
                  fullWidth
                  error={error?.message}
                />
              )}
            />
          </Section>

          <Section>
            <H2Title
              title={t`Pricing`}
              description={t`Cost per million tokens (USD)`}
            />
            <Controller
              name="inputCostPerMillionTokens"
              control={form.control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChange={onChange}
                  placeholder={t`Input cost (e.g. 2.50)`}
                  fullWidth
                />
              )}
            />
            <Controller
              name="outputCostPerMillionTokens"
              control={form.control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChange={onChange}
                  placeholder={t`Output cost (e.g. 10.00)`}
                  fullWidth
                />
              )}
            />
          </Section>

          <Section>
            <H2Title
              title={t`Limits`}
              description={t`Token limits for context and output`}
            />
            <Controller
              name="contextWindowTokens"
              control={form.control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChange={onChange}
                  placeholder={t`Context window (e.g. 128000)`}
                  fullWidth
                />
              )}
            />
            <Controller
              name="maxOutputTokens"
              control={form.control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChange={onChange}
                  placeholder={t`Max output (e.g. 16384)`}
                  fullWidth
                />
              )}
            />
          </Section>

          <Section>
            <H2Title
              title={t`Supports thinking`}
              description={t`Whether this model supports chain-of-thought reasoning`}
            />
            <Controller
              name="doesSupportThinking"
              control={form.control}
              render={({ field: { onChange, value } }) => (
                <Toggle value={value} onChange={onChange} />
              )}
            />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </form>
  );
};
