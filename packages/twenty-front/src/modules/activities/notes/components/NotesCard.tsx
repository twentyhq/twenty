import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { NoteList } from '@/activities/notes/components/NoteList';
import { useNotes } from '@/activities/notes/hooks/useNotes';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { type WidgetHeaderAction } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';

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

  const handleNewNoteClick = () => {
    openCreateActivity({ targetableObjects: [targetRecord] });
  };

  const newNoteAction: WidgetHeaderAction = {
    actionType: 'button',
    Icon: IconPlus,
    label: t`New note`,
    onClick: handleNewNoteClick,
  };

  const widgetHeaderInfoEffect = (
    <WidgetHeaderInfoEffect
      count={totalCountNotes}
      actions={hasObjectUpdatePermissions ? [newNoteAction] : undefined}
    />
  );

  if (loading && isNotesEmpty) {
    return (
      <>
        {widgetHeaderInfoEffect}
        <SkeletonLoader />
      </>
    );
  }

  if (isNotesEmpty) {
    return (
      <>
        {widgetHeaderInfoEffect}
        <AnimatedPlaceholderEmptyContainer>
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
            <Button
              Icon={IconPlus}
              title={t`New note`}
              variant="secondary"
              onClick={handleNewNoteClick}
            />
          )}
        </AnimatedPlaceholderEmptyContainer>
      </>
    );
  }

  return (
    <>
      {widgetHeaderInfoEffect}
      <StyledNotesContainer>
        <NoteList notes={notes} />
        <CustomResolverFetchMoreLoader
          loading={loading}
          onLastRowVisible={handleLastRowVisible}
        />
      </StyledNotesContainer>
    </>
  );
};
