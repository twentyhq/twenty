import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
  return (
    <StyledOptionContainer
      id={id}
      role="option"
      tabIndex={-1}
      aria-selected={selected}
      onClick={onSelect}
    >
      <ListItem
        focused={isActive}
        selected={selected}
        indicator="check"
        startIcon={LeftComponent}
      >
        {text}
      </ListItem>
    </StyledOptionContainer>
  );
};
