import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { styled } from '@linaria/react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSkeletonContainer = styled.div`
  align-content: flex-start;
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledSkeletonSubSection = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledSkeletonSubSectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
`;

const StyledSkeletonColumn = styled(SkeletonLine)`
  corner-shape: round;
`;

const SKELETON_COLUMN_HEIGHTS = {
  short: 84,
  tall: 120,
};

export const SkeletonLoader = ({
  withSubSections = false,
}: {
  withSubSections?: boolean;
}) => {
  const skeletonItems = Array.from({ length: 3 }).map((_, index) => ({
    id: `skeleton-item-${index}`,
  }));

  return (
    <StyledSkeletonContainer>
      <SkeletonLine width={440} height={SKELETON_HEIGHT_SIZES.s} />
      {withSubSections &&
        skeletonItems.map(({ id }, index) => (
          <StyledSkeletonSubSection key={id}>
            <StyledSkeletonColumn
              width={24}
              borderRadius={80}
              height={
                index === 1
                  ? SKELETON_COLUMN_HEIGHTS.tall
                  : SKELETON_COLUMN_HEIGHTS.short
              }
            />
            <StyledSkeletonSubSectionContent>
              <SkeletonLine width={400} height={SKELETON_HEIGHT_SIZES.m} />
              <SkeletonLine width={400} height={SKELETON_HEIGHT_SIZES.m} />
              {index === 1 && (
                <SkeletonLine width={400} height={SKELETON_HEIGHT_SIZES.m} />
              )}
            </StyledSkeletonSubSectionContent>
          </StyledSkeletonSubSection>
        ))}
    </StyledSkeletonContainer>
  );
};
