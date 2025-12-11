import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { RecordCardBodyContainer } from '@/object-record/record-card/components/RecordCardBodyContainer';
import { RecordCardHeaderContainer } from '@/object-record/record-card/components/RecordCardHeaderContainer';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

const StyledSkeletonIconAndText = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledSkeletonTitle = styled.div`
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding-top: 4px;
  padding-bottom: 4px;
`;

const StyledStaticCellSkeleton = styled.div<{ width: number; height: number }>`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;

export const RecordBoardColumnCardContainerSkeletonLoader = () => {
  const theme = useTheme();

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const numberOfFields = visibleRecordFields.length - 1;

  const skeletonItems = Array.from({ length: numberOfFields }).map(
    (_, index) => ({
      id: `skeleton-item-${index}`,
    }),
  );

  const titleSkeletonWidth = isCompactModeActive ? 72 : 54;

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={2}
    >
      <RecordCardHeaderContainer isCompact={isCompactModeActive}>
        <StyledSkeletonTitle>
          <StyledStaticCellSkeleton width={titleSkeletonWidth} height={12} />
        </StyledSkeletonTitle>
      </RecordCardHeaderContainer>
      <StyledBodyContainer>
        {!isCompactModeActive &&
          skeletonItems.map(({ id }) => (
            <RecordCardBodyContainer key={id}>
              <StyledSkeletonIconAndText>
                <StyledStaticCellSkeleton
                  width={16}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
                />
                <StyledStaticCellSkeleton
                  width={151}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
                />
              </StyledSkeletonIconAndText>
            </RecordCardBodyContainer>
          ))}
      </StyledBodyContainer>
    </SkeletonTheme>
  );
};
