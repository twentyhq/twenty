import { styled } from '@linaria/react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

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

export const RecordBoardColumnCardContainerSkeletonLoader = () => {
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
    <>
      <RecordCardHeaderContainer isCompact={isCompactModeActive}>
        <StyledSkeletonTitle>
          <Skeleton
            render={<div />}
            animated={false}
            baseColor={themeCssVariables.background.tertiary}
            borderRadius={themeCssVariables.border.radius.sm}
            width={titleSkeletonWidth}
            height={12}
            style={{ display: 'block' }}
          />
        </StyledSkeletonTitle>
      </RecordCardHeaderContainer>
      <StyledBodyContainer>
        {!isCompactModeActive &&
          skeletonItems.map(({ id }) => (
            <RecordCardBodyContainer key={id}>
              <StyledSkeletonIconAndText>
                <Skeleton
                  render={<div />}
                  animated={false}
                  baseColor={themeCssVariables.background.tertiary}
                  borderRadius={themeCssVariables.border.radius.sm}
                  style={{ display: 'block' }}
                  width={16}
                  height={SKELETON_HEIGHT_SIZES.s}
                />
                <Skeleton
                  render={<div />}
                  animated={false}
                  baseColor={themeCssVariables.background.tertiary}
                  borderRadius={themeCssVariables.border.radius.sm}
                  style={{ display: 'block' }}
                  width={151}
                  height={SKELETON_HEIGHT_SIZES.s}
                />
              </StyledSkeletonIconAndText>
            </RecordCardBodyContainer>
          ))}
      </StyledBodyContainer>
    </>
  );
};
