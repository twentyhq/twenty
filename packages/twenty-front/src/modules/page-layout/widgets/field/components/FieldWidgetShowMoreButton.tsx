import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { IconChevronDown } from 'twenty-ui/display';

type FieldWidgetShowMoreButtonProps = {
  remainingCount: number;
  onClick: () => void;
};

const StyledButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 24px;
  box-sizing: border-box;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  cursor: pointer;
  transition: color ${({ theme }) => theme.animation.duration.instant}s ease;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledIcon = styled(IconChevronDown)`
  height: 16px;
  width: 16px;
`;

export const FieldWidgetShowMoreButton = ({
  remainingCount,
  onClick,
}: FieldWidgetShowMoreButtonProps) => {
  return (
    <StyledButton data-testid="field-widget-show-more-button" onClick={onClick}>
      <StyledIcon />
      {t`More (${remainingCount})`}
    </StyledButton>
  );
};
