import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRow = styled.div`
  > [data-selected] {
    background: ${themeCssVariables.background.transparent.medium};
  }

  > [data-selected]:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

type SuggestionRowProps = {
  children: string;
  startIcon?: ReactNode;
  description?: ReactNode;
  selected?: boolean;
  onSelect: () => void;
};

export const SuggestionRow = ({
  children,
  startIcon,
  description,
  selected = false,
  onSelect,
}: SuggestionRowProps) => (
  <StyledRow>
    <ListItem
      render={<button type="button" />}
      selected={selected}
      startIcon={startIcon}
      description={description}
      onMouseDown={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.stopPropagation();
        }
      }}
      onClick={(event) => {
        event.preventDefault();
        onSelect();
      }}
    >
      <OverflowingTextWithTooltip
        text={<span>{children}</span>}
        tooltipContent={children}
      />
    </ListItem>
  </StyledRow>
);
