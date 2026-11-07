import styled from '@emotion/styled';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const SKELETON_ROW_COUNT = 5;

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

export const SlackUserLinksSettingsSkeleton = () => (
  <StyledContainer aria-busy="true" aria-label="Loading Slack user links">
    <Skeleton layout="block" width={140} height={SKELETON_HEIGHT_SIZES.s} />
    <StyledDescription>
      <Skeleton layout="block" height={SKELETON_HEIGHT_SIZES.xs} />
      <Skeleton layout="block" width="60%" height={SKELETON_HEIGHT_SIZES.xs} />
    </StyledDescription>
    <StyledRows>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <Skeleton key={index} layout="block" height={SKELETON_HEIGHT_SIZES.l} />
      ))}
    </StyledRows>
  </StyledContainer>
);
