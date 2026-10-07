import { styled } from '@linaria/react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

import { themeCssVariables } from 'twenty-ui/theme';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconNameRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
`;

const StyledNameContainer = styled.div`
  flex: 1;
`;

export const CoreAgentDetailSkeletonLoader = () => {
  return (
    <StyledSkeletonContainer>
      <StyledFormSection>
        <StyledIconNameRow>
          <StyledIconContainer>
            <Skeleton
              layout="line"
              baseColor={themeCssVariables.background.tertiary}
              highlightColor={themeCssVariables.background.transparent.lighter}
              borderRadius={4}
              width={SKELETON_HEIGHT_SIZES.l}
              height={SKELETON_HEIGHT_SIZES.l}
            />
          </StyledIconContainer>
          <StyledNameContainer>
            <Skeleton
              layout="line"
              baseColor={themeCssVariables.background.tertiary}
              highlightColor={themeCssVariables.background.transparent.lighter}
              borderRadius={4}
              height={SKELETON_HEIGHT_SIZES.l}
              width="100%"
            />
          </StyledNameContainer>
        </StyledIconNameRow>

        <Skeleton
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          highlightColor={themeCssVariables.background.transparent.lighter}
          borderRadius={4}
          height={SKELETON_HEIGHT_SIZES.l}
          width="100%"
        />

        <Skeleton
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          highlightColor={themeCssVariables.background.transparent.lighter}
          borderRadius={4}
          height={SKELETON_HEIGHT_SIZES.l}
          width="100%"
        />

        <Skeleton
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          highlightColor={themeCssVariables.background.transparent.lighter}
          borderRadius={4}
          height={SKELETON_HEIGHT_SIZES.l}
          width="100%"
        />

        <Skeleton
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          highlightColor={themeCssVariables.background.transparent.lighter}
          borderRadius={4}
          height={SKELETON_HEIGHT_SIZES.l}
          width="100%"
        />

        <Skeleton
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          highlightColor={themeCssVariables.background.transparent.lighter}
          borderRadius={4}
          height={120}
          width="100%"
        />
      </StyledFormSection>
    </StyledSkeletonContainer>
  );
};
