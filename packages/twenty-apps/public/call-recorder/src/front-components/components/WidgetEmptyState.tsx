import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRoot = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  gap: ${() => themeCssVariables.spacing[2]};
  justify-content: center;
  padding: ${() => themeCssVariables.spacing[6]}
    ${() => themeCssVariables.spacing[4]};
  text-align: center;
  width: 100%;
`;

const StyledTitle = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  font-size: ${() => themeCssVariables.font.size.lg};
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
`;

const StyledDescription = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
  line-height: ${() => themeCssVariables.text.lineHeight.lg};
`;

type WidgetEmptyStateProps = {
  title: string;
  description?: string;
};

export const WidgetEmptyState = ({
  title,
  description,
}: WidgetEmptyStateProps) => (
  <StyledRoot>
    <StyledTitle>{title}</StyledTitle>
    {!isUndefined(description) && (
      <StyledDescription>{description}</StyledDescription>
    )}
  </StyledRoot>
);
