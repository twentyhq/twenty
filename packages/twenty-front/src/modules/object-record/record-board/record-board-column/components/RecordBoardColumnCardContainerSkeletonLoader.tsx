import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

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
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledSeparator = styled.div`
  height: ${({ theme }) => theme.spacing(2)};
`;

export const RecordBoardColumnCardContainerSkeletonLoader = () => {
  const theme = useTheme();

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const numberOfFields = visibleRecordFields.length;

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
      borderRadius={4}
    >
      <RecordCardHeaderContainer isCompact={isCompactModeActive}>
        <StyledSkeletonTitle>
          <Skeleton
            width={titleSkeletonWidth}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </StyledSkeletonTitle>
      </RecordCardHeaderContainer>
      <StyledSeparator />
      {!isCompactModeActive &&
        skeletonItems.map(({ id }) => (
          <RecordCardBodyContainer key={id}>
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
          </RecordCardBodyContainer>
        ))}
    </SkeletonTheme>
  );
};
