import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconChevronDown } from 'twenty-ui/display';

const INITIAL_VISIBLE_ITEMS = 5;
const LOAD_MORE_INCREMENT = 5;

const StyledShowMoreButton = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(10)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledShowMoreText = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

type FieldWidgetShowMoreButtonProps = {
  remainingCount: number;
  onClick: () => void;
};

export const FieldWidgetShowMoreButton = ({
  remainingCount,
  onClick,
}: FieldWidgetShowMoreButtonProps) => {
  const theme = useTheme();

  return (
    <StyledShowMoreButton
      onClick={onClick}
      data-testid="field-widget-show-more-button"
    >
      <IconChevronDown
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
        color={theme.font.color.tertiary}
      />
      <StyledShowMoreText>More ({remainingCount})</StyledShowMoreText>
    </StyledShowMoreButton>
  );
};

export { INITIAL_VISIBLE_ITEMS, LOAD_MORE_INCREMENT };
