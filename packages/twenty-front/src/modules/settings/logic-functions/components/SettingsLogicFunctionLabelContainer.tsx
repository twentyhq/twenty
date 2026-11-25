import { SettingsEditableTitle } from '@/settings/components/SettingsEditableTitle';
import { useLingui } from '@lingui/react/macro';

type SettingsLogicFunctionLabelContainerProps = {
  value: string;
  onChange: (value: string) => void;
  readonly?: boolean;
};

export const SettingsLogicFunctionLabelContainer = ({
  value,
  onChange,
  readonly = false,
}: SettingsLogicFunctionLabelContainerProps) => {
  const { t } = useLingui();
  return (
    <SettingsEditableTitle
      instanceId="logic-function-name-input"
      value={value}
      onChange={onChange}
      placeholder={t`Function name`}
      disabled={readonly}
    />
  );
};
