import { styled } from '@linaria/react';
import { type MouseEvent } from 'react';
import { Checkbox } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

type CoreObjectTableCheckboxCellProps = {
  checked: boolean;
  indeterminate?: boolean;
  ariaLabel: string;
  onToggle: () => void;
};

export const CoreObjectTableCheckboxCell = ({
  checked,
  indeterminate = false,
  ariaLabel,
  onToggle,
}: CoreObjectTableCheckboxCellProps) => {
  const stopRowNavigation = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <StyledContainer onClick={stopRowNavigation}>
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        aria-label={ariaLabel}
        onCheckedChange={onToggle}
      />
    </StyledContainer>
  );
};
