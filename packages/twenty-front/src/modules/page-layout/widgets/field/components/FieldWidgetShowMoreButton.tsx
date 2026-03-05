import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { IconChevronDown } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type FieldWidgetShowMoreButtonProps = {
  remainingCount: number;
  onClick: () => void;
};

const StyledButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  box-sizing: border-box;
  padding: 0;
  border: none;
  background: transparent;
  color: ${themeCssVariables.font.color.tertiary};
  font-family: ${themeCssVariables.font.family};
  font-weight: ${themeCssVariables.font.weight.regular};
  cursor: pointer;
  transition: color ${themeCssVariables.animation.duration.instant}s ease;

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
