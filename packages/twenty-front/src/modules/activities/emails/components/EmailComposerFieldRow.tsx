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

const StyledLabel = styled.span<{ $minWidth: string | undefined }>`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: ${({ $minWidth }) => $minWidth ?? 'auto'};
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
  // A floor, not a fixed width: mixed-length labels line up without a long
  // translation running underneath its control.
  labelMinWidth?: string;
};

// The visible label is a plain span, so it cannot be associated with whatever
// control the row wraps. Naming the row as a group gives assistive technology
// the field name even for controls that take no label of their own.
export const EmailComposerFieldRow = ({
  label,
  children,
  trailing,
  labelMinWidth,
}: EmailComposerFieldRowProps) => (
  <StyledRow role="group" aria-label={label}>
    <StyledLabel aria-hidden="true" $minWidth={labelMinWidth}>
      {label}
    </StyledLabel>
    <StyledContent>{children}</StyledContent>
    {trailing}
  </StyledRow>
);
