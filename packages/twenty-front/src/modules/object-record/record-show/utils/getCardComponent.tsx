import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
import { EmailsCard } from '@/activities/emails/components/EmailsCard';
import { FilesCard } from '@/activities/files/components/FilesCard';
import { NotesCard } from '@/activities/notes/components/NotesCard';
import { TasksCard } from '@/activities/tasks/components/TasksCard';
import { TimelineCard } from '@/activities/timeline-activities/components/TimelineCard';
import { FieldsCard } from '@/object-record/record-show/components/FieldsCard';
import {
  type CardConfiguration,
  type CardTypeToConfiguration,
  type FieldCardConfiguration,
} from '@/object-record/record-show/types/CardConfiguration';
import { CardType } from '@/object-record/record-show/types/CardType';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { FieldRichTextCard } from '@/ui/layout/show-page/components/FieldRichTextCard';
import { WorkflowCard } from '@/workflow/workflow-diagram/components/WorkflowCard';
import { WorkflowRunCard } from '@/workflow/workflow-diagram/components/WorkflowRunCard';
import { WorkflowVersionCard } from '@/workflow/workflow-diagram/components/WorkflowVersionCard';
import { assertUnreachable } from 'twenty-shared/utils';

const CardRenderer = <T extends CardConfiguration>({
  Component,
  configuration,
}: {
  Component: React.ComponentType<{ configuration?: T }> | React.ComponentType;
  configuration?: T;
}) => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  if (!targetRecordIdentifier) {
    return null;
  }

  // TypeScript can't infer if Component accepts configuration prop or not
  // So we cast to the more permissive type and let the component ignore unused props
  const ComponentWithConfig = Component as React.ComponentType<{
    configuration?: T;
  }>;

  return <ComponentWithConfig configuration={configuration} />;
};

// Generic function with precise type mapping from CardType to Configuration
// TypeScript will enforce that the correct configuration type is passed for each card type
export const getCardComponent = <T extends CardType>(
  cardType: T,
  configuration?: CardTypeToConfiguration[T],
): JSX.Element | null => {
  switch (cardType) {
    case CardType.TimelineCard:
      return <CardRenderer Component={TimelineCard} />;

    case CardType.FieldCard:
      return (
        <CardRenderer
          Component={FieldsCard}
          configuration={configuration as FieldCardConfiguration | undefined}
        />
      );

    case CardType.FieldRichTextCard:
      return <CardRenderer Component={FieldRichTextCard} />;

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
      throw new Error('Dashboard are handled separately currently');

    default:
      assertUnreachable(cardType);
  }
};
