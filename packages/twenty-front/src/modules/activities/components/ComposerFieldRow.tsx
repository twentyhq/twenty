import { styled } from '@linaria/react';
import { type MouseEventHandler, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const ROW_MIN_HEIGHT = '40px';

const StyledRow = styled.div<{ $clickable: boolean }>`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
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

const StyledTrailing = styled.div`
  align-items: center;
  display: flex;
`;

type ComposerFieldRowProps = {
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  // A floor, not a fixed width, so a long translation doesn't run under its control.
  labelMinWidth?: string;
};

// The label is a plain span, so the row is named as a group to give assistive technology the field name.
export const ComposerFieldRow = ({
  label,
  children,
  trailing,
  onClick,
  labelMinWidth,
}: ComposerFieldRowProps) => (
  <StyledRow
    role="group"
    aria-label={label}
    $clickable={isDefined(onClick)}
    onClick={onClick}
  >
    <StyledLabel aria-hidden="true" $minWidth={labelMinWidth}>
      {label}
    </StyledLabel>
    <StyledContent>{children}</StyledContent>
    {isDefined(trailing) && (
      <StyledTrailing onClick={(event) => event.stopPropagation()}>
        {trailing}
      </StyledTrailing>
    )}
  </StyledRow>
);
