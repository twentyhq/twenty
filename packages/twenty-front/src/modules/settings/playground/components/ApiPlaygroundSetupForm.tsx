import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { openAPIReferenceState } from '@/settings/playground/states/openAPIReference';
import { SettingsPath } from '@/types/SettingsPath';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import {
  Button,
  IconApi,
  IconBracketsAngle,
  IconBrandGraphql,
  IconFolderRoot,
} from 'twenty-ui';
import { z } from 'zod';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export enum PlaygroundTypes {
  GRAPH_QL = 'GraphQl',
  REST = 'Rest',
}

export enum PlaygroundSchemas {
  METADATA = 'Metadata',
  CORE = 'Core',
}

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
  const [, setOpenAPIReference] = useRecoilState(openAPIReferenceState);

  const { control, handleSubmit } = useForm<ApiPlaygroundSetupFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(apiPlaygroundSetupFormSchema),
  });

  const { records: apiKeys } = useFindManyRecords<ApiKey>({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
    filter: { revokedAt: { is: 'NULL' } },
  });

  const getOpenAPIConfig = async (values: ApiPlaygroundSetupFormValues) => {
    const response = await fetch(
      REACT_APP_SERVER_BASE_URL + '/open-api/' + values.schema,
      {
        headers: { Authorization: `Bearer ${values.apiKey}` },
      },
    );

    const openAPIReference = await response.json();
    if (!openAPIReference.tags) {
      throw new Error('Invalid Token');
    }

    setOpenAPIReference(openAPIReference);
  };

  const onSubmit = async (values: ApiPlaygroundSetupFormValues) => {
    sessionStorage.setItem('apiKey', values.apiKey);

    await getOpenAPIConfig(values);

    navigateSettings(SettingsPath.PlaygroundRouter, {
      schema: values.schema.toLowerCase(),
      type: values.apiPlayground.toLowerCase(),
    });
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
            label={t`API Key`}
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
              text: t`Create API Key`,
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
            label={t`Schema`}
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
            label={t`API`}
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
        title={t`Launch`}
        variant="primary"
        accent="blue"
        type="submit"
      />
    </StyledForm>
  );
};
