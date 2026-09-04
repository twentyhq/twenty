import { styled } from '@linaria/react';
import { type MouseEvent } from 'react';
import { Checkbox } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  cursor: pointer;
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
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    onToggle();
  };

  return (
    <StyledContainer onClick={handleClick}>
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        aria-label={ariaLabel}
      />
    </StyledContainer>
  );
};
