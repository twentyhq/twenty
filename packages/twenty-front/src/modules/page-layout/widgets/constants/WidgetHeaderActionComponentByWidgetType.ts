import { WidgetCallRecordingTranscriptActions } from '@/page-layout/widgets/call-recording-transcript/components/WidgetCallRecordingTranscriptActions';
import { WidgetFieldActions } from '@/page-layout/widgets/components/WidgetFieldActions';
import { WidgetActionEmailCompose } from '@/page-layout/widgets/emails/components/WidgetActionEmailCompose';
import { WidgetActionFileAttach } from '@/page-layout/widgets/files/components/WidgetActionFileAttach';
import { WidgetActionNoteCreate } from '@/page-layout/widgets/notes/components/WidgetActionNoteCreate';
import { WidgetActionTaskCreate } from '@/page-layout/widgets/tasks/components/WidgetActionTaskCreate';
import { type ComponentType } from 'react';
import { WidgetType } from '~/generated-metadata/graphql';

export const WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE: Partial<
  Record<WidgetType, ComponentType>
> = {
  [WidgetType.FIELD]: WidgetFieldActions,
  [WidgetType.EMAILS]: WidgetActionEmailCompose,
  [WidgetType.TASKS]: WidgetActionTaskCreate,
  [WidgetType.NOTES]: WidgetActionNoteCreate,
  [WidgetType.FILES]: WidgetActionFileAttach,
  [WidgetType.CALL_RECORDING_TRANSCRIPT]: WidgetCallRecordingTranscriptActions,
};
