import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import {
  StyledBoardCardBody,
  StyledBoardCardHeader,
} from '@/object-record/record-board/record-board-card/components/RecordBoardCard';

const StyledSkeletonIconAndText = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledSkeletonTitle = styled.div`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledSeparator = styled.div`
  height: ${({ theme }) => theme.spacing(2)};
`;

export const RecordBoardColumnCardContainerSkeletonLoader = ({
  numberOfFields,
  titleSkeletonWidth,
  isCompactModeActive,
}: {
  numberOfFields: number;
  titleSkeletonWidth: number;
  isCompactModeActive: boolean;
}) => {
  const theme = useTheme();
  const skeletonItems = Array.from({ length: numberOfFields }).map(
    (_, index) => ({
      id: `skeleton-item-${index}`,
    }),
  );
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledBoardCardHeader showCompactView={isCompactModeActive}>
        <StyledSkeletonTitle>
          <Skeleton
            width={titleSkeletonWidth}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </StyledSkeletonTitle>
      </StyledBoardCardHeader>
      <StyledSeparator />
      {!isCompactModeActive &&
        skeletonItems.map(({ id }) => (
          <StyledBoardCardBody key={id}>
            <StyledSkeletonIconAndText>
              <Skeleton
                width={16}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
              <Skeleton
                width={151}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            </StyledSkeletonIconAndText>
          </StyledBoardCardBody>
        ))}
    </SkeletonTheme>
  );
};
