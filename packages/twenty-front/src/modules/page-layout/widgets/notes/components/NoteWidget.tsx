import { NotesCard } from '@/activities/notes/components/NotesCard';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';
import { Suspense } from 'react';

type NoteWidgetProps = {
  widget: PageLayoutWidget;
};

export const NoteWidget = ({ widget: _widget }: NoteWidgetProps) => (
  <WidgetContentShell>
    <Suspense fallback={<SkeletonLoader />}>
      <NotesCard />
    </Suspense>
  </WidgetContentShell>
);
