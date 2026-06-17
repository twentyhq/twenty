import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { IconChevronDown } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type FieldWidgetShowMoreButtonProps = {
  remainingCount: number;
  onClick: () => void;
};

const StyledButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  padding: 0;
  transition: color ${themeCssVariables.animation.duration.instant}s ease;
  width: 100%;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledIconContainer = styled.span`
  display: flex;
  height: 16px;
  width: 16px;
`;

export const FieldWidgetShowMoreButton = ({
  remainingCount,
  onClick,
}: FieldWidgetShowMoreButtonProps) => {
  return (
    <StyledButton data-testid="field-widget-show-more-button" onClick={onClick}>
      <StyledIconContainer>
        <IconChevronDown />
      </StyledIconContainer>
      {t`More (${remainingCount})`}
    </StyledButton>
  );
};
