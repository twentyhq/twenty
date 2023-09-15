import { DateDisplay } from '@/ui/content-display/components/DateDisplay';
import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldRecoilScopeContext } from '@/ui/editable-field/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { IconComponent } from '@/ui/icon/types/IconComponent';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { parseDate } from '~/utils/date-utils';

import { EditableFieldEditModeDate } from './EditableFieldEditModeDate';

type OwnProps = {
  Icon?: IconComponent;
  label?: string;
  value: string | null | undefined;
  onSubmit?: (newValue: string) => void;
  hotkeyScope: string;
};

export const DateEditableField = ({
  Icon,
  value,
  label,
  onSubmit,
  hotkeyScope,
}: OwnProps) => {
  const handleChange = async (newValue: string) => {
    onSubmit?.(newValue);
  };

  const internalDateValue = value ? parseDate(value).toJSDate() : null;

  return (
    <RecoilScope SpecificContext={FieldRecoilScopeContext}>
      <EditableField
        IconLabel={Icon}
        label={label}
        editModeContent={
          <EditableFieldEditModeDate
            value={value || new Date().toISOString()}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
            parentHotkeyScope={hotkeyScope}
          />
        }
        displayModeContent={<DateDisplay value={internalDateValue} />}
        isDisplayModeContentEmpty={!value}
      />
    </RecoilScope>
  );
};
