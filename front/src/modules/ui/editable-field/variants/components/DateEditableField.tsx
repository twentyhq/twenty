import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldRecoilScopeContext } from '@/ui/editable-field/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { IconComponent } from '@/ui/icon/types/IconComponent';
import { DateInputDisplay } from '@/ui/input/components/DateInputDisplay';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { parseDate } from '~/utils/date-utils';

import { EditableFieldEditModeDate } from './EditableFieldEditModeDate';

type OwnProps = {
  Icon?: IconComponent;
  label?: string;
  value: string | null | undefined;
  onSubmit?: (newValue: string) => void;
};

export function DateEditableField({ Icon, value, label, onSubmit }: OwnProps) {
  async function handleChange(newValue: string) {
    onSubmit?.(newValue);
  }

  const internalDateValue = value ? parseDate(value).toJSDate() : null;

  return (
    <RecoilScope SpecificContext={FieldRecoilScopeContext}>
      <EditableField
        // onSubmit={handleSubmit}
        // onCancel={handleCancel}
        IconLabel={Icon}
        label={label}
        editModeContent={
          <EditableFieldEditModeDate
            value={value || new Date().toISOString()}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
          />
        }
        displayModeContent={<DateInputDisplay value={internalDateValue} />}
        isDisplayModeContentEmpty={!value}
      />
    </RecoilScope>
  );
}
