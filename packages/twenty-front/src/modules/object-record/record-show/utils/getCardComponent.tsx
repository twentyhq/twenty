import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
import { EmailsCard } from '@/activities/emails/components/EmailsCard';
import { FilesCard } from '@/activities/files/components/FilesCard';
import { NotesCard } from '@/activities/notes/components/NotesCard';
import { TasksCard } from '@/activities/tasks/components/TasksCard';
import { TimelineCard } from '@/activities/timeline-activities/components/TimelineCard';
import { DashboardCard } from '@/dashboards/components/DashboardCard';
import { CardRenderer } from '@/object-record/record-show/components/CardRenderer';
import { FieldsCard } from '@/object-record/record-show/components/FieldsCard';
import {
  type CardConfiguration,
  type FieldCardConfiguration,
} from '@/object-record/record-show/types/CardConfiguration';
import { CardType } from '@/object-record/record-show/types/CardType';
import { RichTextCard } from '@/ui/layout/show-page/components/RichTextCard';
import { WorkflowCard } from '@/workflow/workflow-diagram/components/WorkflowCard';
import { WorkflowRunCard } from '@/workflow/workflow-diagram/components/WorkflowRunCard';
import { WorkflowVersionCard } from '@/workflow/workflow-diagram/components/WorkflowVersionCard';

// Returns the appropriate card component for a given card type and configuration
// Replaces the CardComponents registry with a direct mapping function
export const getCardComponent = (
  cardType: CardType,
  configuration?: CardConfiguration,
): JSX.Element | null => {
  switch (cardType) {
    case CardType.TimelineCard:
      return <CardRenderer Component={TimelineCard} />;

    case CardType.FieldCard:
      return (
        <CardRenderer
          Component={FieldsCard}
          configuration={configuration as FieldCardConfiguration}
        />
      );

    case CardType.RichTextCard:
      return <CardRenderer Component={RichTextCard} />;

    case CardType.TaskCard:
      return <CardRenderer Component={TasksCard} />;

    case CardType.NoteCard:
      return <CardRenderer Component={NotesCard} />;

    case CardType.FileCard:
      return <CardRenderer Component={FilesCard} />;

    case CardType.EmailCard:
      return <CardRenderer Component={EmailsCard} />;

    case CardType.CalendarCard:
      return <CardRenderer Component={CalendarEventsCard} />;

    case CardType.WorkflowCard:
      return <CardRenderer Component={WorkflowCard} />;

    case CardType.WorkflowVersionCard:
      return <CardRenderer Component={WorkflowVersionCard} />;

    case CardType.WorkflowRunCard:
      return <CardRenderer Component={WorkflowRunCard} />;

    case CardType.DashboardCard:
      return <CardRenderer Component={DashboardCard} />;

    default:
      return null;
  }
};
