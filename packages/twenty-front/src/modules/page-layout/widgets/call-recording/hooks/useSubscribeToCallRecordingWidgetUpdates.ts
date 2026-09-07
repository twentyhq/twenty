import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { getCallRecordingWidgetFilter } from '@/page-layout/widgets/call-recording/utils/getCallRecordingWidgetFilter';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useCallback, useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useSubscribeToCallRecordingWidgetUpdates = ({
  restriction,
  refetchCallRecordingWidget,
}: {
  restriction: WidgetAccessDenialInfo | undefined;
  refetchCallRecordingWidget: () => Promise<void>;
}) => {
  const widget = useCurrentWidget();
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();
  const targetKind = callRecordingWidgetTarget?.targetKind;
  const targetRecordId = callRecordingWidgetTarget?.recordId;

  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const shouldSkipSubscription =
    !isDefined(targetRecordId) || isDefined(restriction);

  const callRecordingFilter = useMemo(
    () => getCallRecordingWidgetFilter({ targetKind, targetRecordId }),
    [targetKind, targetRecordId],
  );

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
      variables: { filter: callRecordingFilter },
    }),
    [callRecordingFilter],
  );

  useListenToEventsForQuery({
    queryId: `call-recording-widget-${widget.id}-${targetRecordId}`,
    operationSignature,
    skip: shouldSkipSubscription,
    onSseReconnected: refetchCallRecordingWidget,
  });

  const handleCallRecordingOperation = useCallback(() => {
    if (!shouldSkipSubscription) {
      void refetchCallRecordingWidget();
    }
  }, [refetchCallRecordingWidget, shouldSkipSubscription]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleCallRecordingOperation,
    objectMetadataItemId: callRecordingObjectMetadataItem.id,
  });
};
