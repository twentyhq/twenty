import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetFieldActions } from '@/page-layout/widgets/components/WidgetFieldActions';
import { WidgetActionEmailCompose } from '@/page-layout/widgets/emails/components/WidgetActionEmailCompose';
import { WidgetActionFileAttach } from '@/page-layout/widgets/files/components/WidgetActionFileAttach';
import { WidgetActionNoteCreate } from '@/page-layout/widgets/notes/components/WidgetActionNoteCreate';
import { WidgetActionTaskCreate } from '@/page-layout/widgets/tasks/components/WidgetActionTaskCreate';
import { WidgetActionTimeline } from '@/page-layout/widgets/timeline/components/WidgetActionTimeline';
import { type ComponentType } from 'react';
import { WidgetType } from '~/generated-metadata/graphql';

export type WidgetHeaderActionComponentProps = {
  widget: PageLayoutWidget;
};

export const WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE: Partial<
  Record<WidgetType, ComponentType<WidgetHeaderActionComponentProps>>
> = {
  [WidgetType.FIELD]: WidgetFieldActions,
  [WidgetType.EMAILS]: WidgetActionEmailCompose,
  [WidgetType.TASKS]: WidgetActionTaskCreate,
  [WidgetType.NOTES]: WidgetActionNoteCreate,
  [WidgetType.FILES]: WidgetActionFileAttach,
  [WidgetType.TIMELINE]: WidgetActionTimeline,
};
