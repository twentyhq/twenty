import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { useWorkspaceCustomApplicationConnectionProviders } from '@/settings/mcp-servers/hooks/useWorkspaceCustomApplicationConnectionProviders';
import { Select } from '@/ui/input/components/Select';

type SettingsMcpServerConnectionProviderSelectProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

export const SettingsMcpServerConnectionProviderSelect = ({
  value,
  onChange,
}: SettingsMcpServerConnectionProviderSelectProps) => {
  const { t } = useLingui();
  const { connectionProviders } = useWorkspaceCustomApplicationConnectionProviders();

  const options = connectionProviders.map((connectionProvider) => ({
    value: connectionProvider.id,
    label: connectionProvider.displayName,
  }));

  const hasSelectedProvider = options.some(
    (option) => option.value === value,
  );

  return (
    <Select<string | null>
      dropdownId="mcp-server-connection-provider-select"
      options={options}
      emptyOption={{ value: null, label: t`None` }}
      value={isDefined(value) && hasSelectedProvider ? value : null}
      onChange={onChange}
      fullWidth
    />
  );
};
