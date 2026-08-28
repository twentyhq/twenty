import { NotesCard } from '@/activities/notes/components/NotesCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';

type NoteWidgetProps = {
  widget: PageLayoutWidget;
};

export const NoteWidget = ({ widget: _widget }: NoteWidgetProps) => (
  <WidgetContentShell>
    <NotesCard />
  </WidgetContentShell>
);
