import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { useActivityTargetsComponentInstanceId } from '@/activities/inline-cell/hooks/useActivityTargetsComponentInstanceId';
import { type Note } from '@/activities/types/Note';
import { getActivityPreview } from '@/activities/utils/getActivityPreview';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContextProvider } from '@/object-record/record-field/ui/components/FieldContextProvider';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCard = styled.div<{ isSingleNote: boolean }>`
  align-items: flex-start;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 300px;
  justify-content: space-between;
  width: 100%;
`;

const StyledCardDetailsContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: calc(100% - 45px);
  justify-content: start;
  padding: ${themeCssVariables.spacing[4]};
  width: calc(100% - ${themeCssVariables.spacing[8]});
`;

const StyledNoteTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCardContent = styled.div`
  align-self: stretch;
  color: ${themeCssVariables.font.color.secondary};
  line-break: anywhere;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
  width: 100%;
`;

const StyledFooter = styled.div`
  align-items: center;
  align-self: stretch;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]};
  width: calc(100% - ${themeCssVariables.spacing[4]});
`;

export const NoteTile = ({
  note,
  isSingleNote,
}: {
  note: Note;
  isSingleNote: boolean;
}) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const body = getActivityPreview(note?.bodyV2?.blocknote ?? null);

  const baseComponentInstanceId = `note-card-${note.id}-targets`;
  const componentInstanceId = useActivityTargetsComponentInstanceId(
    baseComponentInstanceId,
  );

  return (
    <StyledCard isSingleNote={isSingleNote}>
      <StyledCardDetailsContainer
        onClick={() =>
          openRecordInSidePanel({
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
