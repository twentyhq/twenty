import { styled } from '@linaria/react';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledAddItemContainer = styled.div`
  padding: ${themeCssVariables.spacing[1]};
`;

type MultiItemFieldAddButtonProps = {
  label: string;
  onClick: () => void;
};

export const MultiItemFieldAddButton = ({
  label,
  onClick,
}: MultiItemFieldAddButtonProps) => (
  <StyledAddItemContainer>
    <ListItemButton onClick={onClick} startIcon={<IconPlus />}>
      <OverflowingTextWithTooltip text={label} />
    </ListItemButton>
  </StyledAddItemContainer>
);
