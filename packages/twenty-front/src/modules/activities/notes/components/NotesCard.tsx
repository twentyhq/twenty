import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { NotesCardContent } from '@/activities/notes/components/NotesCardContent';
import { useNotes } from '@/activities/notes/hooks/useNotes';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { useCallback, useMemo } from 'react';
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

  const handleCreateNote = useCallback(
    () => openCreateActivity({ targetableObjects: [targetRecord] }),
    [openCreateActivity, targetRecord],
  );

  const headerActions = useMemo(
    () =>
      hasObjectUpdatePermissions
        ? [
            {
              id: 'new-note',
              Icon: IconPlus,
              label: t`New note`,
              onClick: handleCreateNote,
            },
          ]
        : undefined,
    [hasObjectUpdatePermissions, handleCreateNote],
  );

  return (
    <>
      <WidgetHeaderInfoEffect count={totalCountNotes} actions={headerActions} />
      <NotesCardContent
        loading={loading}
        notes={notes}
        onCreateNote={hasObjectUpdatePermissions ? handleCreateNote : undefined}
        onLastRowVisible={handleLastRowVisible}
      />
    </>
  );
};
