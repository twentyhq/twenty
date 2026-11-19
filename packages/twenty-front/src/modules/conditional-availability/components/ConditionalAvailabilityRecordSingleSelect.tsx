import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

type ConditionalAvailabilityRecordSingleSelectProps = {
  dropdownId: string;
  objectNameSingular: string;
  control: ReactNode;
  value: string | null;
  onChange: (values: string[]) => void;
};

export const ConditionalAvailabilityRecordSingleSelect = ({
  dropdownId,
  objectNameSingular,
  control,
  value,
  onChange,
}: ConditionalAvailabilityRecordSingleSelectProps) => {
  const theme = useTheme();
  const { closeDropdown } = useCloseDropdown();

  const setSingleRecordPickerSelectedId = useSetAtomComponentState(
    singleRecordPickerSelectedIdComponentState,
    dropdownId,
  );

  const handleMorphItemSelected = (
    selectedMorphItem: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    if (isDefined(selectedMorphItem)) {
      onChange([selectedMorphItem.recordId]);
    }

    closeDropdown(dropdownId);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      clickableComponentWidth="100%"
      dropdownOffset={{ y: parseInt(theme.spacing[1], 10) }}
      onOpen={() => setSingleRecordPickerSelectedId(value ?? undefined)}
      clickableComponent={control}
      dropdownComponents={
        <SingleRecordPicker
          focusId={dropdownId}
          componentInstanceId={dropdownId}
          onCancel={() => closeDropdown(dropdownId)}
          onMorphItemSelected={handleMorphItemSelected}
          objectNameSingulars={[objectNameSingular]}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
      }
    />
  );
};
