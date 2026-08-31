import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetActionCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/components/WidgetActionCallRecordingTranscript';
import { WidgetFieldActions } from '@/page-layout/widgets/components/WidgetFieldActions';
import { WidgetActionCalendarEventCreate } from '@/page-layout/widgets/calendar/components/WidgetActionCalendarEventCreate';
import { WidgetActionEmailCompose } from '@/page-layout/widgets/emails/components/WidgetActionEmailCompose';
import { WidgetActionFileAttach } from '@/page-layout/widgets/files/components/WidgetActionFileAttach';
import { WidgetActionNoteCreate } from '@/page-layout/widgets/notes/components/WidgetActionNoteCreate';
import { WidgetActionTaskCreate } from '@/page-layout/widgets/tasks/components/WidgetActionTaskCreate';
import { WidgetActionTimeline } from '@/page-layout/widgets/timeline/components/WidgetActionTimeline';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type ComponentType } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

type WidgetHeaderActionComponentProps = {
  widget: PageLayoutWidget;
};

type WidgetHeaderActionDefinition =
  | {
      kind: 'component';
      Component: ComponentType<WidgetHeaderActionComponentProps>;
    }
  | {
      kind: 'command-menu-items';
      commandMenuItemUniversalIdentifiers: string[];
    };

const widgetHeaderActionComponentByWidgetType: Partial<
  Record<WidgetType, ComponentType<WidgetHeaderActionComponentProps>>
> = {
  [WidgetType.FIELD]: WidgetFieldActions,
  [WidgetType.CALENDAR]: WidgetActionCalendarEventCreate,
  [WidgetType.EMAILS]: WidgetActionEmailCompose,
  [WidgetType.TASKS]: WidgetActionTaskCreate,
  [WidgetType.NOTES]: WidgetActionNoteCreate,
  [WidgetType.FILES]: WidgetActionFileAttach,
  [WidgetType.TIMELINE]: WidgetActionTimeline,
  [WidgetType.CALL_RECORDING_TRANSCRIPT]: WidgetActionCallRecordingTranscript,
};

export const getWidgetHeaderActionDefinition = (
  widget: Pick<PageLayoutWidget, 'configuration' | 'type'>,
): WidgetHeaderActionDefinition | undefined => {
  if (
    isWidgetConfigurationOfType(
      widget.configuration,
      'FrontComponentConfiguration',
    ) &&
    isNonEmptyArray(
      widget.configuration.headerCommandMenuItemUniversalIdentifiers,
    )
  ) {
    return {
      kind: 'command-menu-items',
      commandMenuItemUniversalIdentifiers:
        widget.configuration.headerCommandMenuItemUniversalIdentifiers,
    };
  }

  const Component = widgetHeaderActionComponentByWidgetType[widget.type];

  return isDefined(Component)
    ? {
        kind: 'component',
        Component,
      }
    : undefined;
};
