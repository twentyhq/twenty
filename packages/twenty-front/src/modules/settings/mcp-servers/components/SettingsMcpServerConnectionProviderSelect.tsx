import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { Select } from '@/ui/input/components/Select';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { ApplicationConnectionProvidersDocument } from '~/generated-metadata/graphql';

type SettingsMcpServerConnectionProviderSelectProps = {
  applicationId: string;
  savedConnectionProviderId?: string | null;
};

export const SettingsMcpServerConnectionProviderSelect = ({
  applicationId,
  savedConnectionProviderId,
}: SettingsMcpServerConnectionProviderSelectProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<McpServerFormValues>();
  const { data, loading, error } = useQuery(
    ApplicationConnectionProvidersDocument,
    {
      variables: { applicationId },
    },
  );

  const loadedOptions: SelectOption<string | null>[] = [
    { value: null, label: t`None` },
    // Sign-in providers belong to the server that created them
    ...(data?.applicationConnectionProviders ?? [])
      .filter(
        (connectionProvider) =>
          connectionProvider.type !== 'oauth-discovery' ||
          connectionProvider.id === savedConnectionProviderId,
      )
      .map((connectionProvider) => ({
        value: connectionProvider.id,
        label:
          connectionProvider.type === 'oauth-discovery'
            ? t`Sign in to the server`
            : connectionProvider.displayName,
      })),
  ];

  const getOptions = (value: string | null): SelectOption<string | null>[] => {
    const isValueMissing =
      isDefined(value) &&
      !loadedOptions.some((option) => option.value === value);

    if (!isValueMissing) {
      return loadedOptions;
    }

    return [
      ...loadedOptions,
      { value, label: loading ? t`Loading...` : t`Unavailable` },
    ];
  };

  return (
    <>
      <ToastOnQueryErrorEffect
        error={error}
        message={t`Failed to load connection providers`}
      />
      <Controller
        name="connectionProviderId"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select<string | null>
            dropdownId="mcp-server-connection-provider-select"
            label={t`Connection provider`}
            description={t`Optional. When empty, Twenty sets up sign-in if the server asks for it.`}
            options={getOptions(value)}
            value={value}
            onChange={onChange}
            disabled={loading || isDefined(error)}
            fullWidth
          />
        )}
      />
    </>
  );
};
