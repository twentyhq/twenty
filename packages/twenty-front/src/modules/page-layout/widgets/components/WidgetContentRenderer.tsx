import { CalendarWidget } from '@/page-layout/widgets/calendar/components/CalendarWidget';
import { EmailWidget } from '@/page-layout/widgets/emails/components/EmailWidget';
import { FieldsWidget } from '@/page-layout/widgets/fields/components/FieldsWidget';
import { FileWidget } from '@/page-layout/widgets/files/components/FileWidget';
import { GraphWidgetRenderer } from '@/page-layout/widgets/graph/components/GraphWidgetRenderer';
import { IframeWidget } from '@/page-layout/widgets/iframe/components/IframeWidget';
import { NoteWidget } from '@/page-layout/widgets/notes/components/NoteWidget';
import { RichTextWidget } from '@/page-layout/widgets/rich-text/components/RichTextWidget';
import { TaskWidget } from '@/page-layout/widgets/tasks/components/TaskWidget';
import { TimelineWidget } from '@/page-layout/widgets/timeline/components/TimelineWidget';
import { WorkflowRunWidget } from '@/page-layout/widgets/workflow/components/WorkflowRunWidget';
import { WorkflowVersionWidget } from '@/page-layout/widgets/workflow/components/WorkflowVersionWidget';
import { WorkflowWidget } from '@/page-layout/widgets/workflow/components/WorkflowWidget';
import {
  type PageLayoutWidget,
  WidgetType,
} from '~/generated-metadata/graphql';

type WidgetContentRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetContentRenderer = ({
  widget,
}: WidgetContentRendererProps) => {
  switch (widget.type) {
    case WidgetType.GRAPH:
      return <GraphWidgetRenderer widget={widget} />;

    case WidgetType.IFRAME:
      return <IframeWidget widget={widget} />;

    case WidgetType.FIELDS:
      return <FieldsWidget widget={widget} />;

    case WidgetType.TIMELINE:
      return <TimelineWidget widget={widget} />;

    case WidgetType.TASKS:
      return <TaskWidget widget={widget} />;

    case WidgetType.NOTES:
      return <NoteWidget widget={widget} />;

    case WidgetType.RICH_TEXT:
      return <RichTextWidget widget={widget} />;

    case WidgetType.FILES:
      return <FileWidget widget={widget} />;

    case WidgetType.EMAILS:
      return <EmailWidget widget={widget} />;

    case WidgetType.CALENDAR:
      return <CalendarWidget widget={widget} />;

    case WidgetType.WORKFLOW:
      return <WorkflowWidget />;

    case WidgetType.WORKFLOW_VERSION:
      return <WorkflowVersionWidget />;

    case WidgetType.WORKFLOW_RUN:
      return <WorkflowRunWidget />;

    default:
      return null;
  }
};
