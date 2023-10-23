import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ActivityRelationEditableField } from '@/activities/editable-fields/components/ActivityRelationEditableField';
import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import {
  FieldContext,
  GenericFieldContextType,
} from '@/ui/data/field/contexts/FieldContext';
import { IconComment } from '@/ui/display/icon';
import { Activity, ActivityTarget } from '~/generated/graphql';

const StyledCard = styled.div`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 300px;
  justify-content: space-between;
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
}: {
  note: Pick<
    Activity,
    'id' | 'title' | 'body' | 'type' | 'completedAt' | 'dueAt' | 'comments'
  > & {
    activityTargets?: Array<Pick<ActivityTarget, 'id'>> | null;
  };
}) => {
  const theme = useTheme();
  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const body = JSON.parse(note.body ?? '{}')[0]
    ?.content.map((x: any) => x.text)
    .join('\n');

  const fieldContext = useMemo(
    () => ({ recoilScopeId: note?.id ?? '' }),
    [note?.id],
  );

  return (
    <FieldContext.Provider value={fieldContext as GenericFieldContextType}>
      <StyledCard>
        <StyledCardDetailsContainer
          onClick={() => openActivityRightDrawer(note.id)}
        >
          <StyledNoteTitle>{note.title ?? 'Task Title'}</StyledNoteTitle>
          <StyledCardContent>{body}</StyledCardContent>
        </StyledCardDetailsContainer>
        <StyledFooter>
          <ActivityRelationEditableField activity={note} />
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
