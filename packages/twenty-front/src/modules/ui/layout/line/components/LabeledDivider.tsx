import { styled } from '@linaria/react';
import { Separator } from 'twenty-ui/primitives/layout';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div<{ noMargin: boolean }>`
  align-items: center;
  display: flex;
  margin-block: ${({ noMargin }) =>
    noMargin ? '0' : themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledLabel = styled(Text)`
  color: ${themeCssVariables.font.color.light};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-inline: ${themeCssVariables.spacing[2]};
`;

type LabeledDividerProps = {
  children: string;
  noMargin?: boolean;
  color?: string;
  textPosition?: 'center' | 'end';
};

export const LabeledDivider = ({
  children,
  noMargin = false,
  color,
  textPosition = 'center',
}: LabeledDividerProps) => {
  const separatorStyle = {
    backgroundColor: color,
    flexGrow: 1,
    margin: 0,
    width: 'auto',
  };

  return (
    <StyledContainer role="separator" aria-label={children} noMargin={noMargin}>
      <Separator aria-hidden style={separatorStyle} />
      <StyledLabel render={<span />} style={{ color }}>
        {children}
      </StyledLabel>
      {textPosition === 'center' && (
        <Separator aria-hidden style={separatorStyle} />
      )}
    </StyledContainer>
  );
};
