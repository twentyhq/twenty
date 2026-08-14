import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { NotesCardContent } from '@/activities/notes/components/NotesCardContent';
import { useNotes } from '@/activities/notes/hooks/useNotes';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { IconPlus } from 'twenty-ui/icon';

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

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const newNoteAction = useMemo(
    () =>
      hasObjectUpdatePermissions
        ? {
            id: 'new-note',
            Icon: IconPlus,
            label: t`New note`,
            onClick: () =>
              openCreateActivity({ targetableObjects: [targetRecord] }),
          }
        : undefined,
    [hasObjectUpdatePermissions, openCreateActivity, targetRecord],
  );

  return (
    <>
      <WidgetHeaderInfoEffect
        count={totalCountNotes}
        actions={isDefined(newNoteAction) ? [newNoteAction] : undefined}
      />
      <NotesCardContent
        loading={loading}
        notes={notes}
        onCreateNote={newNoteAction?.onClick}
        onLastRowVisible={handleLastRowVisible}
      />
    </>
  );
};
