import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { Select } from '@/ui/input/components/Select';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { ApplicationConnectionProvidersDocument } from '~/generated-metadata/graphql';

type SettingsMcpServerConnectionProviderSelectProps = {
  applicationId: string;
};

export const SettingsMcpServerConnectionProviderSelect = ({
  applicationId,
}: SettingsMcpServerConnectionProviderSelectProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<McpServerFormValues>();
  const { data, loading, error } = useQuery(
    ApplicationConnectionProvidersDocument,
    {
      variables: { applicationId },
    },
  );

  const options: SelectOption<string | null>[] = [
    { value: null, label: t`None` },
    ...(data?.applicationConnectionProviders ?? []).map(
      (connectionProvider) => ({
        value: connectionProvider.id,
        label: connectionProvider.displayName,
      }),
    ),
  ];

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
            options={options}
            value={value}
            onChange={onChange}
            disabled={loading}
            fullWidth
          />
        )}
      />
    </>
  );
};
