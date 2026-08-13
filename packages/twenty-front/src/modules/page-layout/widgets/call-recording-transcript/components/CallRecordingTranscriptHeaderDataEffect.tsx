import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { CallRecordingTranscriptHeaderDataSyncEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptHeaderDataSyncEffect';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { isDefined } from 'twenty-shared/utils';

type CallRecordingTranscriptHeaderDataEffectProps = {
  callRecordingsCount: number;
  transcriptPlainText: string | undefined;
  videoFileUrl: string | undefined;
};

export const CallRecordingTranscriptHeaderDataEffect = ({
  callRecordingsCount,
  transcriptPlainText,
  videoFileUrl,
}: CallRecordingTranscriptHeaderDataEffectProps) => {
  const pageLayoutInstanceId = useAvailableComponentInstanceId(
    PageLayoutComponentInstanceContext,
  );
  const widgetInstanceId = useAvailableComponentInstanceId(
    WidgetComponentInstanceContext,
  );

  if (isDefined(pageLayoutInstanceId) && isDefined(widgetInstanceId)) {
    return (
      <CallRecordingTranscriptHeaderDataSyncEffect
        callRecordingsCount={callRecordingsCount}
        transcriptPlainText={transcriptPlainText}
        videoFileUrl={videoFileUrl}
        pageLayoutInstanceId={pageLayoutInstanceId}
        widgetInstanceId={widgetInstanceId}
      />
    );
  }

  return null;
};
