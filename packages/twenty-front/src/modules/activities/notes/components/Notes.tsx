import styled from '@emotion/styled';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { NoteList } from '@/activities/notes/components/NoteList';
import { useNotes } from '@/activities/notes/hooks/useNotes';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  StyledEmptyContainer,
  StyledEmptySubTitle,
  StyledEmptyTextContainer,
  StyledEmptyTitle,
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
  const { notes } = useNotes(targetableObject);

  const openCreateActivity = useOpenCreateActivityDrawer();

  if (notes?.length === 0) {
    return (
      <StyledEmptyContainer>
        <AnimatedPlaceholder type="noNote" />
        <StyledEmptyTextContainer>
          <StyledEmptyTitle>No notes</StyledEmptyTitle>
          <StyledEmptySubTitle>
            There are no associated notes with this record.
          </StyledEmptySubTitle>
        </StyledEmptyTextContainer>
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
      </StyledEmptyContainer>
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
