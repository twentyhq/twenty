import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconPoint } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

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
  margin-right: 0;
  display: flex;
  align-items: center;
`;

export const AdvancedSettingsContentWrapperWithDot = ({
  children,
  hideDot = false,
  dotPosition = 'centered',
}: AdvancedSettingsContentWrapperWithDotProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledWrapper>
      {!hideDot && (
        <StyledDotContainer dotPosition={dotPosition}>
          <StyledIconPointContainer>
            <IconPoint
              size={12}
              color={theme.color.yellow}
              fill={theme.color.yellow}
            />
          </StyledIconPointContainer>
        </StyledDotContainer>
      )}
      {children}
    </StyledWrapper>
  );
};
