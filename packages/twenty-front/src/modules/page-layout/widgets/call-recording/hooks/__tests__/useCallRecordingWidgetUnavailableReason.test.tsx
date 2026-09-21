import { useCallRecordingWidgetUnavailableReason } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetUnavailableReason';
import { renderHook } from '@testing-library/react';

const mockLayoutRenderingContext: {
  targetRecordIdentifier?: {
    id: string;
    targetObjectNameSingular: string;
  };
} = {};

let objectMetadataItems: { nameSingular: string }[];

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems }),
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => mockLayoutRenderingContext,
}));

describe('useCallRecordingWidgetUnavailableReason', () => {
  beforeEach(() => {
    objectMetadataItems = [{ nameSingular: 'callRecording' }];
    mockLayoutRenderingContext.targetRecordIdentifier = {
      id: 'calendar-event-id',
      targetObjectNameSingular: 'calendarEvent',
    };
  });

  it('reports nothing on a record the widget can reach a recording from', () => {
    const { result: calendarEventResult } = renderHook(() =>
      useCallRecordingWidgetUnavailableReason(),
    );

    expect(calendarEventResult.current).toBeUndefined();

    mockLayoutRenderingContext.targetRecordIdentifier = {
      id: 'call-recording-id',
      targetObjectNameSingular: 'callRecording',
    };

    const { result: callRecordingResult } = renderHook(() =>
      useCallRecordingWidgetUnavailableReason(),
    );

    expect(callRecordingResult.current).toBeUndefined();
  });

  it('separates a workspace without call recording from a record without one', () => {
    objectMetadataItems = [{ nameSingular: 'person' }];

    const { result: workspaceResult } = renderHook(() =>
      useCallRecordingWidgetUnavailableReason(),
    );

    expect(workspaceResult.current).toBe('workspaceWithoutCallRecording');

    objectMetadataItems = [{ nameSingular: 'callRecording' }];
    mockLayoutRenderingContext.targetRecordIdentifier = {
      id: 'person-id',
      targetObjectNameSingular: 'person',
    };

    const { result: recordResult } = renderHook(() =>
      useCallRecordingWidgetUnavailableReason(),
    );

    expect(recordResult.current).toBe('recordWithoutCallRecording');
  });
});
