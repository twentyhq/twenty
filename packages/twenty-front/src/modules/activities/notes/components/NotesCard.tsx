import { useCreateActivityForTargetRecord } from '@/activities/hooks/useCreateActivityForTargetRecord';
import { NotesCardContent } from '@/activities/notes/components/NotesCardContent';
import { useNotes } from '@/activities/notes/hooks/useNotes';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const NotesCard = () => {
  const targetRecord = useTargetRecord();
  const {
    notes,
    totalCountNotes,
    fetchMoreNotes,
    isFetchingMoreNotes,
    hasNextPage,
  } = useNotes(targetRecord);

  const handleLastRowVisible = async () => {
    if (hasNextPage) {
      await fetchMoreNotes();
    }
  };

  const { canCreateActivity, createActivity } =
    useCreateActivityForTargetRecord({
      targetRecord,
      activityObjectNameSingular: CoreObjectNameSingular.Note,
    });

  return (
    <>
      <WidgetHeaderCountEffect count={totalCountNotes} />
      <NotesCardContent
        isFetchingMore={isFetchingMoreNotes}
        notes={notes}
        onCreateNote={canCreateActivity ? createActivity : undefined}
        onLastRowVisible={handleLastRowVisible}
      />
    </>
  );
};
