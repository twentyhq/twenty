import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { IconChevronDown } from 'twenty-ui/display';

const StyledShowMoreButton = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 24px;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.border.radius.sm};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
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
      <StyledShowMoreText>{t`More (${remainingCount})`}</StyledShowMoreText>
    </StyledShowMoreButton>
  );
};
