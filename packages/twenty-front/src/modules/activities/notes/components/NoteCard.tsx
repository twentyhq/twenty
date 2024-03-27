import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconComment } from 'twenty-ui';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { Note } from '@/activities/types/Note';
import { getActivityPreview } from '@/activities/utils/getActivityPreview';
import {
  FieldContext,
  GenericFieldContextType,
} from '@/object-record/record-field/contexts/FieldContext';

const StyledCard = styled.div<{ isSingleNote: boolean }>`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 300px;
  justify-content: space-between;
  max-width: ${({ isSingleNote }) => (isSingleNote ? '300px' : 'unset')};
`;

const StyledCardDetailsContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: calc(100% - 45px);
  justify-content: start;
  padding: ${({ theme }) => theme.spacing(2)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledNoteTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledCardContent = styled.div`
  align-self: stretch;
  color: ${({ theme }) => theme.font.color.secondary};
  line-break: anywhere;
  margin-top: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
  width: 100%;
`;

const StyledFooter = styled.div`
  align-items: center;
  align-self: stretch;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledCommentIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

export const NoteCard = ({
  note,
  isSingleNote,
}: {
  note: Note;
  isSingleNote: boolean;
}) => {
  const theme = useTheme();
  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const body = getActivityPreview(note.body);

  const fieldContext = useMemo(
    () => ({ recoilScopeId: note?.id ?? '' }),
    [note?.id],
  );

  return (
    <FieldContext.Provider value={fieldContext as GenericFieldContextType}>
      <StyledCard isSingleNote={isSingleNote}>
        <StyledCardDetailsContainer
          onClick={() => openActivityRightDrawer(note.id)}
        >
          <StyledNoteTitle>{note.title ?? 'Task Title'}</StyledNoteTitle>
          <StyledCardContent>{body}</StyledCardContent>
        </StyledCardDetailsContainer>
        <StyledFooter>
          <ActivityTargetsInlineCell activity={note} />
          {note.comments && note.comments.length > 0 && (
            <StyledCommentIcon>
              <IconComment size={theme.icon.size.md} />
              {note.comments.length}
            </StyledCommentIcon>
          )}
        </StyledFooter>
      </StyledCard>
    </FieldContext.Provider>
  );
};
