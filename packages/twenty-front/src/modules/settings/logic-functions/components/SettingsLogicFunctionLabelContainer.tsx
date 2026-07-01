import { SettingsEditableTitle } from '@/settings/components/SettingsEditableTitle';
import { t } from '@lingui/core/macro';

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
