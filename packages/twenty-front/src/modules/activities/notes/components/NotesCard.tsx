import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { NoteList } from '@/activities/notes/components/NoteList';
import { useNotes } from '@/activities/notes/hooks/useNotes';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAICElement } from '@aicorg/sdk-react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
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

export const NotesCard = () => {
  const targetRecord = useTargetRecord();
  const { notes, loading, totalCountNotes, fetchMoreNotes, hasNextPage } =
    useNotes(targetRecord);

  const handleLastRowVisible = async () => {
    if (hasNextPage) {
      await fetchMoreNotes();
    }
  };

  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Note,
  });

  const isNotesEmpty = notes.length === 0;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const noteActionId = `${targetRecord.targetObjectNameSingular}.note.add.${targetRecord.id}`;
  const noteActionLabel = `Add note to ${targetRecord.targetObjectNameSingular}`;
  const noteWorkflowStep = `${targetRecord.targetObjectNameSingular}.add_note`;
  const noteAction = useAICElement({
    agentId: noteActionId,
    agentAction: 'open',
    agentDescription:
      'Open the note creation flow for the current record without changing the destructive-action state.',
    agentEntityId: targetRecord.id,
    agentEntityLabel: `${targetRecord.targetObjectNameSingular} ${targetRecord.id}`,
    agentEntityType: targetRecord.targetObjectNameSingular,
    agentExamples: ['Requested security review before proposal.'],
    agentLabel: noteActionLabel,
    agentRisk: 'medium',
    agentWorkflowStep: noteWorkflowStep,
  });

  if (loading && isNotesEmpty) {
    return <SkeletonLoader />;
  }

  if (isNotesEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noNote" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No notes`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`There are no associated notes with this record.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        {hasObjectUpdatePermissions && (
          <div {...noteAction.attributes}>
            <Button
              Icon={IconPlus}
              title={t`New note`}
              variant="secondary"
              onClick={() =>
                openCreateActivity({
                  targetableObjects: [targetRecord],
                })
              }
            />
          </div>
        )}
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledNotesContainer>
      <NoteList
        title={t`All`}
        notes={notes}
        totalCount={totalCountNotes}
        button={
          hasObjectUpdatePermissions && (
            <div {...noteAction.attributes}>
              <Button
                Icon={IconPlus}
                size="small"
                variant="secondary"
                title={t`Add note`}
                onClick={() =>
                  openCreateActivity({
                    targetableObjects: [targetRecord],
                  })
                }
              />
            </div>
          )
        }
      />
      <CustomResolverFetchMoreLoader
        loading={loading}
        onLastRowVisible={handleLastRowVisible}
      />
    </StyledNotesContainer>
  );
};
