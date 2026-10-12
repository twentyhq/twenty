import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  line-height: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  min-inline-size: 0;

  span {
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
`;

const StyledIcon = styled.span`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;

  & > svg {
    block-size: calc(${themeCssVariables.icon.size.sm} * 1px);
    inline-size: calc(${themeCssVariables.icon.size.sm} * 1px);
  }
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.tooltip.descriptionColor};
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

type TooltipTextContentProps = {
  children?: ReactNode;
  description?: ReactNode;
  startIcon?: ReactNode;
};

export const TooltipTextContent = ({
  children,
  description,
  startIcon,
}: TooltipTextContentProps) => (
  <StyledContent>
    {isDefined(children) && children !== '' && (
      <StyledTitle>
        {isDefined(startIcon) && (
          <StyledIcon aria-hidden>{startIcon}</StyledIcon>
        )}
        <span>{children}</span>
      </StyledTitle>
    )}
    {isDefined(description) && (
      <StyledDescription>{description}</StyledDescription>
    )}
  </StyledContent>
);
