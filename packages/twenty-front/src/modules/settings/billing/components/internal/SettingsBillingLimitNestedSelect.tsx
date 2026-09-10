import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';

import { StyledSettingsBillingFieldLabel } from '@/settings/billing/components/internal/SettingsBillingFieldLabel';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

const StyledContainer = styled.div`
  width: 100%;
`;

type SettingsBillingLimitNestedSelectProps = {
  dropdownId: string;
  label: string;
  selectedLabel: string;
  SelectedIcon?: IconComponent;
  SelectedAvatar?: ReactNode;
  isDisabled?: boolean;
  dropdownComponents: ReactNode;
  onClose?: () => void;
};

export const SettingsBillingLimitNestedSelect = ({
  dropdownId,
  label,
  selectedLabel,
  SelectedIcon,
  SelectedAvatar,
  isDisabled = false,
  dropdownComponents,
  onClose,
}: SettingsBillingLimitNestedSelectProps) => {
  const selectedOption = {
    value: selectedLabel,
    label: selectedLabel,
    Icon: SelectedIcon,
  };

  return (
    <StyledContainer>
      <StyledSettingsBillingFieldLabel>{label}</StyledSettingsBillingFieldLabel>
      {isDisabled ? (
        <SelectControl
          selectedOption={selectedOption}
          LeftComponent={SelectedAvatar}
          isDisabled
        />
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="bottom-start"
          onClose={onClose}
          clickableComponent={
            <SelectControl
              selectedOption={selectedOption}
              LeftComponent={SelectedAvatar}
            />
          }
          dropdownComponents={dropdownComponents}
        />
      )}
    </StyledContainer>
  );
};
