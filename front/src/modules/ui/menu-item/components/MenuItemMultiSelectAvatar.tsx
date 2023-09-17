import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { Checkbox } from '@/ui/input/components/Checkbox';

import {
  StyledMenuItemBase,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

const StyledLeftContentWithCheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type OwnProps = {
  avatar?: ReactNode;
  selected: boolean;
  text: string;
  className?: string;
  onSelectChange?: (selected: boolean) => void;
};

export const MenuItemMultiSelectAvatar = ({
  avatar,
  text,
  selected,
  className,
  onSelectChange,
}: OwnProps) => {
  const handleOnClick = () => {
    onSelectChange?.(!selected);
  };

  return (
    <StyledMenuItemBase className={className} onClick={handleOnClick}>
      <StyledLeftContentWithCheckboxContainer>
        <Checkbox checked={selected} />
        <StyledMenuItemLeftContent>
          {avatar}
          <StyledMenuItemLabel hasLeftIcon={!!avatar}>
            {text}
          </StyledMenuItemLabel>
        </StyledMenuItemLeftContent>
      </StyledLeftContentWithCheckboxContainer>
    </StyledMenuItemBase>
  );
};
