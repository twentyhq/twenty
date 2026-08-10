import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const ROW_MIN_HEIGHT = '40px';

const StyledRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${ROW_MIN_HEIGHT};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  width: 100%;

  &:last-of-type {
    border-bottom: none;
  }
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
`;

type EmailComposerFieldRowProps = {
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
};

export const EmailComposerFieldRow = ({
  label,
  children,
  trailing,
}: EmailComposerFieldRowProps) => (
  <StyledRow>
    <StyledLabel>{label}</StyledLabel>
    <StyledContent>{children}</StyledContent>
    {trailing}
  </StyledRow>
);
