import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, type Ref } from 'react';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledListItemButton = styled(ListItemButton)`
  &[aria-selected='true'] {
    background: ${themeCssVariables.background.transparent.medium};
  }

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

type SuggestionListItemProps = {
  id?: string;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
  startIcon?: ReactNode;
  description?: string;
  selected: boolean;
  onSelect: () => void;
};

export const SuggestionListItem = ({
  id,
  ref,
  children,
  startIcon,
  description,
  selected,
  onSelect,
}: SuggestionListItemProps) => (
  <StyledListItemButton
    id={id}
    ref={ref}
    role="option"
    aria-selected={selected}
    selected={selected}
    tabIndex={-1}
    startIcon={startIcon}
    description={
      isNonEmptyString(description) ? (
        <OverflowingTextWithTooltip
          text={description}
          render={<StyledDescription />}
        />
      ) : undefined
    }
    onMouseDown={(event) => event.preventDefault()}
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect();
    }}
  >
    {children}
  </StyledListItemButton>
);
