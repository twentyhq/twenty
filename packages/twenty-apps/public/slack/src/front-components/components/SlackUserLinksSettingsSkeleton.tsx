import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const SKELETON_ROW_COUNT = 5;

const shimmer = keyframes`
  to { transform: translateX(100%); }
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  margin-bottom: ${() => themeCssVariables.spacing[6]};
  margin-top: ${() => themeCssVariables.spacing[2]};
`;

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
`;

// TODO(@abdulrahmancodes): use Skeleton from twenty-ui/primitives/feedback once this app is on twenty-ui 2.x
const StyledBar = styled.span`
  background-color: ${() => themeCssVariables.background.tertiary};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  display: block;
  overflow: hidden;
  position: relative;
  width: 100%;

  &::after {
    animation: ${shimmer} 1.5s ease-in-out infinite;
    background-image: linear-gradient(
      90deg,
      ${() => themeCssVariables.background.tertiary} 0%,
      ${() => themeCssVariables.background.transparent.lighter} 50%,
      ${() => themeCssVariables.background.tertiary} 100%
    );
    content: ' ';
    inset: 0;
    position: absolute;
    transform: translateX(-100%);
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      display: none;
    }
  }
`;

const StyledTitleBar = styled(StyledBar)`
  height: 16px;
  width: 140px;
`;

const StyledDescriptionLine = styled(StyledBar)`
  height: 13px;

  &:last-of-type {
    width: 60%;
  }
`;

const StyledRow = styled(StyledBar)`
  height: 32px;
`;

export const SlackUserLinksSettingsSkeleton = () => (
  <StyledContainer aria-busy="true" aria-label="Loading Slack user links">
    <StyledTitleBar />
    <StyledDescription>
      <StyledDescriptionLine />
      <StyledDescriptionLine />
    </StyledDescription>
    <StyledRows>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <StyledRow key={index} />
      ))}
    </StyledRows>
  </StyledContainer>
);
