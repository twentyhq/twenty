import { openAPIReferenceState } from '@/settings/playground/states/openAPIReference';
import {
  PlaygroundSchemas,
  PlaygroundTypes,
} from '@/settings/playground/types/PlaygroundConfig';
import { setPlaygroundSession } from '@/settings/playground/utils/setPlaygroundSession';
import { SettingsPath } from '@/types/SettingsPath';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
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

export const playgroundSetupFormSchema = z.object({
  apiKeyForPlayground: z.string(),
  schema: z.nativeEnum(PlaygroundSchemas),
  playgroundType: z.nativeEnum(PlaygroundTypes),
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
  const [, setOpenAPIReference] = useRecoilState(openAPIReferenceState);

  const { control, handleSubmit } = useForm<PlaygroundSetupFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(playgroundSetupFormSchema),
  });

  const getOpenAPIConfig = async (values: PlaygroundSetupFormValues) => {
    const response = await fetch(
      REACT_APP_SERVER_BASE_URL + '/open-api/' + values.schema,
      {
        headers: { Authorization: `Bearer ${values.apiKeyForPlayground}` },
      },
    );

    const openAPIReference = await response.json();
    if (!openAPIReference.tags) {
      throw new Error(t`Invalid API Key`);
    }

    setOpenAPIReference(openAPIReference);
  };

  const onSubmit = async (values: PlaygroundSetupFormValues) => {
    setPlaygroundSession(values.schema, values.apiKeyForPlayground);

    await getOpenAPIConfig(values);

    const path =
      values.playgroundType === PlaygroundTypes.GRAPHQL
        ? SettingsPath.GraphQLPlayground
        : SettingsPath.RestPlayground;

    navigateSettings(path, {
      schema: values.schema.toLowerCase(),
    });
  };

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name={'apiKeyForPlayground'}
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label={'API Key'}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNzQxMTkyODk5LCJleHAiOjQ4OTQ3OTI4OTgsImp0aSI6ImRjZjhmMGZiLTExMTMtNDhmNC1iZWY2LWQ2N2UxNWM0NGM5ZSJ9.jPvNMtWsjbe-MvAWvqia3MJNtoVDHxhAf9o8BLDNBEc"
            value={value}
            onChange={(value) => {
              onChange(value);
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
                label: t`Core`,
                Icon: IconFolderRoot,
              },
              {
                value: PlaygroundSchemas.METADATA,
                label: t`Metadata`,
                Icon: IconBracketsAngle,
              },
            ]}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Controller
        name={'playgroundType'}
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
      <Button title={t`Launch`} variant="primary" accent="blue" type="submit" />
    </StyledForm>
  );
};
