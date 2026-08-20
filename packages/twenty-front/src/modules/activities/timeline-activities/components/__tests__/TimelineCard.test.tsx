import { TimelineCard } from '@/activities/timeline-activities/components/TimelineCard';
import { render, screen } from '@testing-library/react';

jest.mock('@/activities/components/CustomResolverFetchMoreLoader', () => ({
  CustomResolverFetchMoreLoader: () => (
    <div data-testid="timeline-fetch-more-loader" />
  ),
}));

jest.mock('@/activities/timeline-activities/components/EventList', () => ({
  EventList: () => <div data-testid="timeline-event-list" />,
}));

jest.mock(
  '@/activities/timeline-activities/hooks/useTimelineActivities',
  () => ({
    useTimelineActivities: () => ({
      timelineActivities: [{ id: 'timeline-activity-id' }],
      firstQueryLoading: false,
      loadingMore: false,
      fetchMoreRecords: jest.fn(),
    }),
  }),
);

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({ isInSidePanel: false }),
}));

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({
    id: 'record-id',
    targetObjectNameSingular: 'company',
  }),
}));

describe('TimelineCard', () => {
  it('keeps the event list and pagination sentinel in the same content flow', () => {
    render(<TimelineCard />);

    const eventList = screen.getByTestId('timeline-event-list');
    const fetchMoreLoader = screen.getByTestId('timeline-fetch-more-loader');

    expect(eventList.parentElement).toBe(fetchMoreLoader.parentElement);
  });
});
