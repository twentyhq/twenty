import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconPoint } from 'twenty-ui/display';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme';

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

  ${({ dotPosition }) => {
    if (dotPosition === 'top') {
      return `
        top: 0;
      `;
    }
    return `
      align-items: center;
    `;
  }}
`;

const StyledIconPoint = styled(IconPoint)`
  margin-right: 0;
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
          <StyledIconPoint
            size={12}
            color={theme.color.yellow}
            fill={theme.color.yellow}
          />
        </StyledDotContainer>
      )}
      {children}
    </StyledWrapper>
  );
};
