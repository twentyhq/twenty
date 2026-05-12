import { useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { ADD_MODEL_TO_PROVIDER } from '@/settings/admin-panel/ai/graphql/mutations/addModelToProvider';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { GET_MODELS_DEV_SUGGESTIONS } from '@/settings/admin-panel/ai/graphql/queries/getModelsDevSuggestions';
import { type GetAiProvidersResult } from '@/settings/admin-panel/ai/types/GetAiProvidersResult';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Checkbox, Toggle } from 'twenty-ui/input';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[4]};
`;

const MODALITY_OPTIONS = [
  { value: 'image', label: t`Image` },
  { value: 'pdf', label: t`PDF` },
  { value: 'audio', label: t`Audio` },
  { value: 'video', label: t`Video` },
];

const StyledCheckboxRow = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledModalitiesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type ModelSuggestion = {
  modelId: string;
  name: string;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  contextWindowTokens: number;
  maxOutputTokens: number;
  modalities: string[];
  supportsReasoning: boolean;
};

type FormValues = {
  name: string;
  label: string;
  inputCostPerMillionTokens: string;
  outputCostPerMillionTokens: string;
  cachedInputCostPerMillionTokens: string;
  cacheCreationCostPerMillionTokens: string;
  contextWindowTokens: string;
  maxOutputTokens: string;
  modalities: string[];
  supportsReasoning: boolean;
};

export const SettingsAdminNewAiModel = () => {
  const { providerName } = useParams<{ providerName: string }>();
  const apolloAdminClient = useApolloAdminClient();
  const navigate = useNavigate();
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomModelId, setIsCustomModelId] = useState(false);

  const { data: providersData } = useQuery<GetAiProvidersResult>(
    GET_AI_PROVIDERS,
    {
      client: apolloAdminClient,
    },
  );

  const provider =
    providerName && providersData?.getAiProviders
      ? providersData.getAiProviders[providerName]
      : undefined;

  const modelsDevName = provider?.name;

  const { data: suggestionsData } = useQuery<{
    getModelsDevSuggestions: ModelSuggestion[];
  }>(GET_MODELS_DEV_SUGGESTIONS, {
    client: apolloAdminClient,
    variables: { providerType: modelsDevName ?? '' },
    skip: !modelsDevName,
  });

  const suggestions = useMemo(
    () => suggestionsData?.getModelsDevSuggestions ?? [],
    [suggestionsData?.getModelsDevSuggestions],
  );

  const suggestionsByModelId = useMemo(() => {
    const map = new Map<string, ModelSuggestion>();

    for (const suggestion of suggestions) {
      map.set(suggestion.modelId, suggestion);
    }

    return map;
  }, [suggestions]);

  const modelIdOptions = suggestions.map((suggestion) => ({
    value: suggestion.modelId,
    label: `${suggestion.name} (${suggestion.modelId})`,
  }));

  const [addModelToProvider] = useMutation(ADD_MODEL_TO_PROVIDER, {
    client: apolloAdminClient,
  });

  const form = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      label: '',
      inputCostPerMillionTokens: '',
      outputCostPerMillionTokens: '',
      cachedInputCostPerMillionTokens: '',
      cacheCreationCostPerMillionTokens: '',
      contextWindowTokens: '',
      maxOutputTokens: '',
      modalities: [],
      supportsReasoning: false,
    },
  });

  const providerDetailPath = providerName
    ? getSettingsPath(SettingsPath.AdminPanelAiProviderDetail, {
        providerName,
      })
    : getSettingsPath(SettingsPath.AdminPanel);

  const handleModelIdSelected = (modelId: string) => {
    form.setValue('name', modelId);
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
        'cachedInputCostPerMillionTokens',
        isDefined(suggestion.cachedInputCostPerMillionTokens)
          ? String(suggestion.cachedInputCostPerMillionTokens)
          : '',
      );
      form.setValue(
        'cacheCreationCostPerMillionTokens',
        isDefined(suggestion.cacheCreationCostPerMillionTokens)
          ? String(suggestion.cacheCreationCostPerMillionTokens)
          : '',
      );
      form.setValue(
        'contextWindowTokens',
        String(suggestion.contextWindowTokens),
      );
      form.setValue('maxOutputTokens', String(suggestion.maxOutputTokens));
      form.setValue('modalities', suggestion.modalities ?? []);
      form.setValue('supportsReasoning', suggestion.supportsReasoning);
    }
  };

  const handleSave = async () => {
    if (!providerName) {
      return;
    }

    const values = form.getValues();

    if (!values.name.trim()) {
      form.setError('name', {
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

    const cachedInput = parseFloat(
      values.cachedInputCostPerMillionTokens || '',
    );
    const cacheCreation = parseFloat(
      values.cacheCreationCostPerMillionTokens || '',
    );

    const modelConfig = {
      name: values.name.trim(),
      label: values.label.trim(),
      inputCostPerMillionTokens: parseFloat(
        values.inputCostPerMillionTokens || '0',
      ),
      outputCostPerMillionTokens: parseFloat(
        values.outputCostPerMillionTokens || '0',
      ),
      ...(isFinite(cachedInput) && {
        cachedInputCostPerMillionTokens: cachedInput,
      }),
      ...(isFinite(cacheCreation) && {
        cacheCreationCostPerMillionTokens: cacheCreation,
      }),
      contextWindowTokens: parseInt(values.contextWindowTokens || '0', 10),
      maxOutputTokens: parseInt(values.maxOutputTokens || '0', 10),
      ...(values.modalities.length > 0 && {
        modalities: values.modalities,
      }),
      supportsReasoning: values.supportsReasoning,
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
  const showModelSelect = hasSuggestions && !isCustomModelId;

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
                showModelSelect
                  ? t`Select a known model or add a custom one`
                  : t`The model identifier used by the provider API`
              }
            />
            {showModelSelect ? (
              <Controller
                name="name"
                control={form.control}
                render={({ field: { value } }) => (
                  <Select
                    dropdownId="ai-model-id-select"
                    value={value || undefined}
                    onChange={handleModelIdSelected}
                    options={modelIdOptions}
                    withSearchInput
                    fullWidth
                    callToActionButton={{
                      text: t`Custom model ID`,
                      onClick: () => setIsCustomModelId(true),
                      Icon: IconPlus,
                    }}
                  />
                )}
              />
            ) : (
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
            <StyledComboInputContainer>
              <Controller
                name="inputCostPerMillionTokens"
                control={form.control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label={t`Input`}
                    value={value}
                    onChange={onChange}
                    placeholder={t`e.g. 2.50`}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="outputCostPerMillionTokens"
                control={form.control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label={t`Output`}
                    value={value}
                    onChange={onChange}
                    placeholder={t`e.g. 10.00`}
                    fullWidth
                  />
                )}
              />
            </StyledComboInputContainer>
          </Section>

          <Section>
            <H2Title
              title={t`Cache pricing`}
              description={t`Cost per million tokens for cached input (USD)`}
            />
            <StyledComboInputContainer>
              <Controller
                name="cachedInputCostPerMillionTokens"
                control={form.control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label={t`Cache read`}
                    value={value}
                    onChange={onChange}
                    placeholder={t`e.g. 1.25`}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="cacheCreationCostPerMillionTokens"
                control={form.control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label={t`Cache write`}
                    value={value}
                    onChange={onChange}
                    placeholder={t`e.g. 3.75`}
                    fullWidth
                  />
                )}
              />
            </StyledComboInputContainer>
          </Section>

          <Section>
            <H2Title
              title={t`Limits`}
              description={t`Token limits for context and output`}
            />
            <StyledComboInputContainer>
              <Controller
                name="contextWindowTokens"
                control={form.control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label={t`Context window`}
                    value={value}
                    onChange={onChange}
                    placeholder={t`e.g. 128000`}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="maxOutputTokens"
                control={form.control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label={t`Max output`}
                    value={value}
                    onChange={onChange}
                    placeholder={t`e.g. 16384`}
                    fullWidth
                  />
                )}
              />
            </StyledComboInputContainer>
          </Section>

          <Section>
            <H2Title
              title={t`Supported input types`}
              description={t`Types of content this model can process besides text`}
            />
            <Controller
              name="modalities"
              control={form.control}
              render={({ field: { onChange, value } }) => (
                <StyledModalitiesContainer>
                  {MODALITY_OPTIONS.map((option) => {
                    const isChecked = value.includes(option.value);

                    return (
                      <StyledCheckboxRow
                        key={option.value}
                        onClick={() => {
                          const updated = isChecked
                            ? value.filter(
                                (modality) => modality !== option.value,
                              )
                            : [...value, option.value];

                          onChange(updated);
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          onChange={(event) => {
                            event.stopPropagation();
                            const updated = event.target.checked
                              ? [...value, option.value]
                              : value.filter(
                                  (modality) => modality !== option.value,
                                );

                            onChange(updated);
                          }}
                        />
                        <span>{option.label}</span>
                      </StyledCheckboxRow>
                    );
                  })}
                </StyledModalitiesContainer>
              )}
            />
          </Section>

          <Section>
            <H2Title
              title={t`Supports reasoning`}
              description={t`Whether this model supports chain-of-thought reasoning`}
            />
            <Controller
              name="supportsReasoning"
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
