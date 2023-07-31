import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { ProbabilityFieldEditMode } from './ProbabilityFieldEditMode';

type OwnProps = {
  icon?: React.ReactNode;
  value: number | null | undefined;
  onSubmit?: (newValue: number) => void;
};

export function ProbabilityEditableField({ icon, value, onSubmit }: OwnProps) {
  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        iconLabel={icon}
        displayModeContentOnly
        disableHoverEffect
        displayModeContent={
          <ProbabilityFieldEditMode value={value ?? 0} onChange={onSubmit} />
        }
      />
    </RecoilScope>
  );
}
