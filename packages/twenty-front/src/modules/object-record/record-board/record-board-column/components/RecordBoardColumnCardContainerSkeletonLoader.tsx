import { styled } from '@linaria/react';
import { useContext } from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { RecordCardBodyContainer } from '@/object-record/record-card/components/RecordCardBodyContainer';
import { RecordCardHeaderContainer } from '@/object-record/record-card/components/RecordCardHeaderContainer';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

const StyledSkeletonIconAndText = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSkeletonTitle = styled.div`
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  padding-bottom: 4px;
  padding-top: 4px;
`;

const StyledStaticCellSkeleton = styled.div<{ width: number; height: number }>`
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};

  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
`;

export const RecordBoardColumnCardContainerSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const visibleRecordFields = useAtomComponentSelectorValue(
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
