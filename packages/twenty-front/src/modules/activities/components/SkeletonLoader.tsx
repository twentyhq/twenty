import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';
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
      <Skeleton width={440} height={16} />
      {withSubSections &&
        skeletonItems.map(({ id }, index) => (
          <StyledSkeletonSubSection key={id}>
            <Skeleton
              width={24}
              borderRadius={80}
              height={
                index === 1
                  ? SKELETON_COLUMN_HEIGHTS.tall
                  : SKELETON_COLUMN_HEIGHTS.short
              }
            />
            <StyledSkeletonSubSectionContent>
              <Skeleton width={400} height={24} />
              <Skeleton width={400} height={24} />
              {index === 1 && <Skeleton width={400} height={24} />}
            </StyledSkeletonSubSectionContent>
          </StyledSkeletonSubSection>
        ))}
    </StyledSkeletonContainer>
  );
};
