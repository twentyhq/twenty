import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

import { Select } from '@/ui/input/components/Select';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { ApplicationConnectionProvidersDocument } from '~/generated-metadata/graphql';

type SettingsMcpServerConnectionProviderSelectProps = {
  applicationId: string;
  value: string | null;
  onChange: (value: string | null) => void;
};

export const SettingsMcpServerConnectionProviderSelect = ({
  applicationId,
  value,
  onChange,
}: SettingsMcpServerConnectionProviderSelectProps) => {
  const { t } = useLingui();
  const { data, loading } = useQuery(ApplicationConnectionProvidersDocument, {
    variables: { applicationId },
  });

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
    <Select<string | null>
      dropdownId="mcp-server-connection-provider-select"
      options={options}
      value={value}
      onChange={onChange}
      disabled={loading}
      fullWidth
    />
  );
};
