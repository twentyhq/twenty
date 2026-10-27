import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const SKELETON_ROW_COUNT = 5;
const TITLE_BAR_WIDTH_PIXELS = 140;
const TITLE_BAR_HEIGHT_PIXELS = 16;
const DESCRIPTION_LINE_HEIGHT_PIXELS = 13;
const LAST_DESCRIPTION_LINE_WIDTH = '60%';
const ROW_HEIGHT_PIXELS = 32;

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
  gap: ${() => themeCssVariables.spacing[2]};
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
  height: ${TITLE_BAR_HEIGHT_PIXELS}px;
  width: ${TITLE_BAR_WIDTH_PIXELS}px;
`;

const StyledDescriptionLine = styled(StyledBar)`
  height: ${DESCRIPTION_LINE_HEIGHT_PIXELS}px;

  &:last-of-type {
    width: ${LAST_DESCRIPTION_LINE_WIDTH};
  }
`;

const StyledRow = styled(StyledBar)`
  height: ${ROW_HEIGHT_PIXELS}px;
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
