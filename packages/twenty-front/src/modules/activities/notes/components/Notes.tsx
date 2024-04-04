import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { NoteList } from '@/activities/notes/components/NoteList';
import { useNotes } from '@/activities/notes/hooks/useNotes';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';

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
  const { notes, initialized } = useNotes(targetableObject);

  const openCreateActivity = useOpenCreateActivityDrawer();

  if (!initialized) {
    return <></>;
  }

  if (notes?.length === 0) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="noNote" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No notes
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            There are no associated notes with this record.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        <Button
          Icon={IconPlus}
          title="New note"
          variant="secondary"
          onClick={() =>
            openCreateActivity({
              type: 'Note',
              targetableObjects: [targetableObject],
            })
          }
        />
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledNotesContainer>
      <NoteList
        title="All"
        notes={notes ?? []}
        button={
          <Button
            Icon={IconPlus}
            size="small"
            variant="secondary"
            title="Add note"
            onClick={() =>
              openCreateActivity({
                type: 'Note',
                targetableObjects: [targetableObject],
              })
            }
          ></Button>
        }
      />
    </StyledNotesContainer>
  );
};
