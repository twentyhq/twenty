import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import {
  MenuItemLeftContent,
  StyledMenuItemIconCheck,
  StyledMenuItemSelect,
} from 'twenty-ui/navigation';
import { useTheme } from 'twenty-ui/theme-constants';

const StyledOptionContainer = styled.div`
  cursor: pointer;
  width: 100%;
`;

type DropdownMenuOptionProps = {
  id: string;
  text: string;
  selected: boolean;
  isActive: boolean;
  LeftComponent?: ReactNode;
  onSelect: () => void;
};

export const DropdownMenuOption = ({
  id,
  text,
  selected,
  isActive,
  LeftComponent,
  onSelect,
}: DropdownMenuOptionProps) => {
  const theme = useTheme();

  return (
    <StyledOptionContainer
      id={id}
      role="option"
      tabIndex={-1}
      aria-selected={selected}
      onClick={onSelect}
    >
      <StyledMenuItemSelect focused={isActive}>
        <MenuItemLeftContent
          LeftComponent={LeftComponent}
          LeftIcon={null}
          text={text}
        />
        {selected && <StyledMenuItemIconCheck size={theme.icon.size.md} />}
      </StyledMenuItemSelect>
    </StyledOptionContainer>
  );
};
