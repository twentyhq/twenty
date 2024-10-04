import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { BACKGROUND_LIGHT, GRAY_SCALE } from 'twenty-ui';

const StyledSkeletonContainer = styled.div`
  align-items: flex-start;

  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 196px;
  max-width: 196px;
`;

export const MainNavigationDrawerItemsSkeletonLoader = ({
  title,
  length,
}: {
  title?: boolean;
  length: number;
}) => {
  return (
    <StyledSkeletonContainer>
      <SkeletonTheme
        baseColor={GRAY_SCALE.gray15}
        highlightColor={BACKGROUND_LIGHT.transparent.lighter}
        borderRadius={4}
      >
        {title && <Skeleton width={48} height={13} />}
        {Array.from({ length }).map((_, index) => (
          <Skeleton key={index} width={196} height={16} />
        ))}
      </SkeletonTheme>
    </StyledSkeletonContainer>
  );
};
