import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { RecList } from '@/activities/rec/components/RecList';
import { useRecs } from '@/activities/rec/hooks/useRecs';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import styled from '@emotion/styled';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui';

const StyledNotesContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const Recs = ({
  // eslint-disable-next-line unused-imports/no-unused-vars
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { records, loading } = useRecs();

  // const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  // const openCreateActivity = useOpenCreateActivityDrawer({
  //   activityObjectNameSingular: CoreObjectNameSingular.Vehicle,
  // });

  const isRecsEmpty = !records || records.length === 0;

  if (loading && isRecsEmpty) {
    return <SkeletonLoader />;
  }

  if (isRecsEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noNote" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No Recomendations
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            There are no associated Recs with this record.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledNotesContainer>
      <RecList title="All" records={records} />
    </StyledNotesContainer>
  );
};
