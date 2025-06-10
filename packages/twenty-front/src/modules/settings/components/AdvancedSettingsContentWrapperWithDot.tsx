import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPoint } from 'twenty-ui/display';

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
  left: ${({ theme }) => theme.spacing(-5)};

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
  const theme = useTheme();
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
