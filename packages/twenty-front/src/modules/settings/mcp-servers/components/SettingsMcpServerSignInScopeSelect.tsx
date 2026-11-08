import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { type SelectOption } from 'twenty-ui/primitives/input';

import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { Select } from '@/ui/input/components/Select';
import { ConnectionProviderScope } from '~/generated-metadata/graphql';

type SettingsMcpServerSignInScopeSelectProps = {
  instanceId: string;
};

export const SettingsMcpServerSignInScopeSelect = ({
  instanceId,
}: SettingsMcpServerSignInScopeSelectProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<McpServerFormValues>();

  const options: SelectOption<ConnectionProviderScope>[] = [
    { value: ConnectionProviderScope.USER, label: t`Each member signs in` },
    {
      value: ConnectionProviderScope.WORKSPACE,
      label: t`One shared account for the workspace`,
    },
  ];

  return (
    <Controller
      name="signInScope"
      control={control}
      render={({ field: { onChange, value } }) => (
        <Select<ConnectionProviderScope>
          dropdownId={instanceId}
          label={t`Who signs in`}
          description={t`Changing this removes the current connections.`}
          options={options}
          value={value ?? ConnectionProviderScope.USER}
          onChange={onChange}
          fullWidth
        />
      )}
    />
  );
};
