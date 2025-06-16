import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { NoteList } from '@/activities/notes/components/NoteList';
import { useNotes } from '@/activities/notes/hooks/useNotes';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

const StyledNotesContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const Notes = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { notes, loading } = useNotes(targetableObject);

  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Note,
  });

  const isNotesEmpty = !notes || notes.length === 0;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  if (loading && isNotesEmpty) {
    return <SkeletonLoader />;
  }

  if (isNotesEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noNote" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No notes
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            There are no associated notes with this record.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        {hasObjectUpdatePermissions && (
          <Button
            Icon={IconPlus}
            title="New note"
            variant="secondary"
            onClick={() =>
              openCreateActivity({
                targetableObjects: [targetableObject],
              })
            }
          />
        )}
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledNotesContainer>
      <NoteList
        title="All"
        notes={notes}
        button={
          hasObjectUpdatePermissions && (
            <Button
              Icon={IconPlus}
              size="small"
              variant="secondary"
              title="Add note"
              onClick={() =>
                openCreateActivity({
                  targetableObjects: [targetableObject],
                })
              }
            />
          )
        }
      />
    </StyledNotesContainer>
  );
};
