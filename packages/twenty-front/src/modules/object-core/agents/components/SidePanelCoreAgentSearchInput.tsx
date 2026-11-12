import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

const StyledSearchContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type SidePanelCoreAgentSearchInputProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export const SidePanelCoreAgentSearchInput = ({
  value,
  placeholder,
  onChange,
}: SidePanelCoreAgentSearchInputProps) => (
  <StyledSearchContainer>
    <DropdownMenuSearchInput
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </StyledSearchContainer>
);
