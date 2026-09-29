import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';

import { StyledSettingsBillingFieldLabel } from '@/settings/billing/components/internal/SettingsBillingFieldLabel';
import { StyledSelectDescription } from '@/ui/input/components/internal/select/components/StyledSelectDescription';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

const StyledContainer = styled.div`
  width: 100%;
`;

type SettingsBillingLimitNestedSelectProps = {
  dropdownId: string;
  label: string;
  description?: ReactNode;
  selectedLabel: string;
  selectedContextualText?: string;
  SelectedIcon?: IconComponent;
  SelectedAvatar?: ReactNode;
  isDisabled?: boolean;
  children: ReactNode;
};

export const SettingsBillingLimitNestedSelect = ({
  dropdownId,
  label,
  description,
  selectedLabel,
  selectedContextualText,
  SelectedIcon,
  SelectedAvatar,
  isDisabled = false,
  children,
}: SettingsBillingLimitNestedSelectProps) => {
  const selectedOption = {
    value: selectedLabel,
    label: selectedLabel,
    contextualText: selectedContextualText,
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
        <DropdownRoot dropdownId={dropdownId} type="picker">
          <Dropdown.Trigger render={<div />} nativeButton={false}>
            <SelectControl
              selectedOption={selectedOption}
              LeftComponent={SelectedAvatar}
            />
          </Dropdown.Trigger>
          <DropdownContent align="start" aria-label={label}>
            {children}
          </DropdownContent>
        </DropdownRoot>
      )}
      {isDefined(description) && (
        <StyledSelectDescription>{description}</StyledSelectDescription>
      )}
    </StyledContainer>
  );
};
