import { styled } from '@linaria/react';
import { IconPoint } from 'twenty-ui/display';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledWrapper = styled.div`
  position: relative;
  width: 100%;
`;
type DotPosition = 'top' | 'centered';

type AdvancedSettingsContentWrapperWithDotProps = {
  children: React.ReactNode;
  hideDot?: boolean;
  dotPosition?: DotPosition;
};

const StyledDotContainer = styled.div<{ dotPosition: DotPosition }>`
  display: flex;
  position: absolute;
  height: 100%;
  left: calc(-1 * ${themeCssVariables.spacing[5]});

  top: ${({ dotPosition }) => (dotPosition === 'top' ? '0' : 'auto')};
  align-items: ${({ dotPosition }) =>
    dotPosition === 'top' ? 'stretch' : 'center'};
`;

const StyledIconPointContainer = styled.span`
  display: flex;
  margin-right: 0;
`;

export const AdvancedSettingsContentWrapperWithDot = ({
  children,
  hideDot = false,
  dotPosition = 'centered',
}: AdvancedSettingsContentWrapperWithDotProps) => {
  return (
    <StyledWrapper>
      {!hideDot && (
        <StyledDotContainer dotPosition={dotPosition}>
          <StyledIconPointContainer>
            <IconPoint
              size={12}
              color={resolveThemeVariable(themeCssVariables.color.yellow)}
              fill={resolveThemeVariable(themeCssVariables.color.yellow)}
            />
          </StyledIconPointContainer>
        </StyledDotContainer>
      )}
      {children}
    </StyledWrapper>
  );
};
