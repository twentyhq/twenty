import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCardMedia = styled.div`
  align-items: stretch;
  border: 2px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 2px;
  height: 40px;
  justify-content: center;
  padding: 2px;
  width: 32px;
`;

const StyledSkeleton = styled.div<{ $isActive: boolean }>`
  background-color: ${({ $isActive }) =>
    $isActive
      ? themeCssVariables.accent.accent7
      : themeCssVariables.background.quaternary};
  border-radius: 1px;
  height: 3px;
`;

const StyledMetadataSkeleton = styled(StyledSkeleton)`
  margin-right: ${() => themeCssVariables.spacing[2]};
`;

const StyledBodySkeleton = styled(StyledSkeleton)`
  flex: 1 0 auto;
`;

type LinkedinVisibilityIconProps = {
  isBodyActive: boolean;
};

export const LinkedinVisibilityIcon = ({
  isBodyActive,
}: LinkedinVisibilityIconProps) => (
  <StyledCardMedia>
    <StyledMetadataSkeleton $isActive />
    <StyledBodySkeleton $isActive={isBodyActive} />
  </StyledCardMedia>
);
