import { SETTINGS_PLAYGROUND_FORM_SCHEMA_SELECT_OPTIONS } from '@/settings/playground/constants/SettingsPlaygroundFormSchemaSelectOptions';
import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { PlaygroundTypes } from '@/settings/playground/types/PlaygroundTypes';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { CustomError } from 'twenty-shared/utils';
import { IconApi, IconBrandGraphql } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { z } from 'zod';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const playgroundSetupFormSchema = z.object({
  apiKeyForPlayground: z.string(),
  schema: z.enum(PlaygroundSchemas),
  playgroundType: z.enum(PlaygroundTypes),
});

type PlaygroundSetupFormValues = z.infer<typeof playgroundSetupFormSchema>;

const StyledForm = styled.form`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 0.5fr;
  align-items: end;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const PlaygroundSetupForm = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const [playgroundApiKey, setPlaygroundApiKey] = useRecoilState(
    playgroundApiKeyState,
  );

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setError,
  } = useForm<PlaygroundSetupFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(playgroundSetupFormSchema),
    defaultValues: {
      schema: PlaygroundSchemas.CORE,
      playgroundType: PlaygroundTypes.REST,
      apiKeyForPlayground: playgroundApiKey || '',
    },
  });

  const validateApiKey = async (values: PlaygroundSetupFormValues) => {
    try {
      // Validate by fetching the schema (but not storing it)
      const response = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/rest/open-api/${values.schema}`,
        {
          headers: { Authorization: `Bearer ${values.apiKeyForPlayground}` },
        },
      );

      if (!response.ok) {
        throw new CustomError(
          `HTTP error! status: ${response.status}`,
          'HTTP_ERROR',
        );
      }

      const openAPIReference = await response.json();

      if (!openAPIReference.tags) {
        throw new Error('Invalid API Key');
      }

      return true;
    } catch {
      throw new Error(t`Invalid API key`);
    }
  };

  const onSubmit = async (values: PlaygroundSetupFormValues) => {
    try {
      await validateApiKey(values);

      setPlaygroundApiKey(values.apiKeyForPlayground);

      const path =
        values.playgroundType === PlaygroundTypes.GRAPHQL
          ? SettingsPath.GraphQLPlayground
          : SettingsPath.RestPlayground;

      navigateSettings(path, {
        schema: values.schema.toLowerCase(),
      });
    } catch (error) {
      setError('apiKeyForPlayground', {
        type: 'manual',
        message:
          error instanceof Error
            ? error.message
            : t`An unexpected error occurred`,
      });
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="apiKeyForPlayground"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <SettingsTextInput
            instanceId="playground-api-key"
            label={t`API Key`}
            placeholder={t`Enter your API key`}
            value={value}
            onChange={(newValue) => {
              onChange(newValue);
              setPlaygroundApiKey(newValue);
            }}
            error={error?.message}
            required
          />
        )}
      />
      <Controller
        name="schema"
        control={control}
        defaultValue={PlaygroundSchemas.CORE}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownId="schema"
            label={t`Schema`}
            options={SETTINGS_PLAYGROUND_FORM_SCHEMA_SELECT_OPTIONS.map(
              (option) => ({
                ...option,
                label: t(option.label),
              }),
            )}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Controller
        name="playgroundType"
        control={control}
        defaultValue={PlaygroundTypes.REST}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownId="apiPlaygroundType"
            label={t`API`}
            options={[
              {
                value: PlaygroundTypes.REST,
                label: t`REST`,
                Icon: IconApi,
              },
              {
                value: PlaygroundTypes.GRAPHQL,
                label: t`GraphQL`,
                Icon: IconBrandGraphql,
              },
            ]}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Button
        title={t`Launch`}
        variant="primary"
        accent="blue"
        type="submit"
        disabled={isSubmitting}
      />
    </StyledForm>
  );
};
