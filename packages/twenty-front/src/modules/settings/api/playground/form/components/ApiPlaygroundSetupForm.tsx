import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { SettingsPath } from '@/types/SettingsPath';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Button,
  IconApi,
  IconBracketsAngle,
  IconBrandGraphql,
  IconFolderRoot,
} from 'twenty-ui';
import { z } from 'zod';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const PlaygroundTypes = {
  GRAPH_QL: 'GraphQl',
  REST: 'Rest',
} as const;
export type PlaygroundTypes = (typeof PlaygroundTypes)[keyof typeof PlaygroundTypes];

const PlaygroundSchemas = {
  METADATA: 'Metadata',
  CORE: 'Core',
} as const;
type PlaygroundSchemas =
  (typeof PlaygroundSchemas)[keyof typeof PlaygroundSchemas];

export const apiPlaygroundSetupFormSchema = z.object({
  apiKey: z.string(),
  schema: z.nativeEnum(PlaygroundSchemas),
  apiPlayground: z.nativeEnum(PlaygroundTypes),
});

type ApiPlaygroundSetupFormValues = z.infer<
  typeof apiPlaygroundSetupFormSchema
>;

const StyledForm = styled.form`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 0.5fr;
  align-items: end;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const ApiPlaygroundSetupForm = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  const { control, handleSubmit } = useForm<ApiPlaygroundSetupFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(apiPlaygroundSetupFormSchema),
  });

  const { records: apiKeys } = useFindManyRecords<ApiKey>({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
    filter: { revokedAt: { is: 'NULL' } },
  });

  const onSubmit = async (values: ApiPlaygroundSetupFormValues) => {
    window.localStorage.setItem(
      'TryIt_securitySchemeValues',
      JSON.stringify({ bearerAuth: values.apiKey }),
    );

    window.localStorage.setItem(
      'baseUrl',
      JSON.stringify({
        baseUrl: 'http://localhost:3000',
        locationSetting: 'localhost',
      }),
    );

    window.localStorage.setItem(
      'schema',
      JSON.stringify({
        schema: values.schema,
      }),
    );

    navigateSettings(
      SettingsPath.APIPlayground,
      { schema: values.schema.toLowerCase(), type: values.apiPlayground.toLowerCase() }
    );
  };

  const apiKey = useWatch({ control, name: 'apiKey' });

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name={'apiKey'}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownId="apiKey"
            label="API Key"
            options={
              apiKeys.length > 0
                ? apiKeys.map((apiKey) => ({
                    value: apiKey.id,
                    label: apiKey.name,
                  }))
                : [{ value: '', label: 'No API Key' }]
            }
            value={value}
            onChange={onChange}
            callToActionButton={{
              text: 'Create API Key',
              onClick: () => navigateSettings(SettingsPath.DevelopersNewApiKey),
            }}
          />
        )}
      />
      <Controller
        name={'schema'}
        control={control}
        defaultValue={PlaygroundSchemas.CORE}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownId="schema"
            label="Schema"
            options={[
              {
                value: PlaygroundSchemas.CORE,
                label: PlaygroundSchemas.CORE,
                Icon: IconFolderRoot,
              },
              {
                value: PlaygroundSchemas.METADATA,
                label: PlaygroundSchemas.METADATA,
                Icon: IconBracketsAngle,
              },
            ]}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Controller
        name={'apiPlayground'}
        control={control}
        defaultValue={PlaygroundTypes.REST}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownId="apiPlaygroundType"
            label="API"
            options={[
              {
                value: PlaygroundTypes.REST,
                label: PlaygroundTypes.REST,
                Icon: IconApi,
              },
              {
                value: PlaygroundTypes.GRAPH_QL,
                label: PlaygroundTypes.GRAPH_QL,
                Icon: IconBrandGraphql,
              },
            ]}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Button
        disabled={!apiKey || apiKey.length === 0}
        title="Launch"
        variant="primary"
        accent="blue"
        type="submit"
      />
    </StyledForm>
  );
};
