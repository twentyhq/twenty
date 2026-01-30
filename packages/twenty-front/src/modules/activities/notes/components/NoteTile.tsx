import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { useActivityTargetsComponentInstanceId } from '@/activities/inline-cell/hooks/useActivityTargetsComponentInstanceId';
import { type Note } from '@/activities/types/Note';
import { getActivityPreview } from '@/activities/utils/getActivityPreview';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContextProvider } from '@/object-record/record-field/ui/components/FieldContextProvider';

const StyledCard = styled.div<{ isSingleNote: boolean }>`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 300px;
  justify-content: space-between;
  width: 100%;
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
  padding: ${({ theme }) => theme.spacing(4)};
  width: calc(100% - ${({ theme }) => theme.spacing(8)});
  box-sizing: border-box;
`;

const StyledNoteTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledCardContent = styled.div`
  align-self: stretch;
  color: ${({ theme }) => theme.font.color.secondary};
  line-break: anywhere;
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

export const NoteTile = ({
  note,
  isSingleNote,
}: {
  note: Note;
  isSingleNote: boolean;
}) => {
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const body = getActivityPreview(note?.bodyV2?.blocknote ?? null);

  const baseComponentInstanceId = `note-card-${note.id}-targets`;
  const componentInstanceId = useActivityTargetsComponentInstanceId(
    baseComponentInstanceId,
  );

  return (
    <StyledCard isSingleNote={isSingleNote}>
      <StyledCardDetailsContainer
        onClick={() =>
          openRecordInCommandMenu({
            recordId: note.id,
            objectNameSingular: CoreObjectNameSingular.Note,
          })
        }
      >
        <StyledNoteTitle>{note.title ?? t`Task Title`}</StyledNoteTitle>
        <StyledCardContent>{body}</StyledCardContent>
      </StyledCardDetailsContainer>
      <StyledFooter>
        <FieldContextProvider
          objectNameSingular={CoreObjectNameSingular.Note}
          objectRecordId={note.id}
          fieldMetadataName="noteTargets"
          fieldPosition={0}
        >
          <RecordFieldsScopeContextProvider
            value={{
              scopeInstanceId: note.id,
            }}
          >
            <ActivityTargetsInlineCell
              componentInstanceId={componentInstanceId}
              activityRecordId={note.id}
              activityObjectNameSingular={CoreObjectNameSingular.Note}
            />
          </RecordFieldsScopeContextProvider>
        </FieldContextProvider>
      </StyledFooter>
    </StyledCard>
  );
};
