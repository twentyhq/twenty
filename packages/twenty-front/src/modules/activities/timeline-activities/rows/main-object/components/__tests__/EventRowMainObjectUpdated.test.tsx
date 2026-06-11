import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render } from '@testing-library/react';
import { type ReactNode } from 'react';

import { EventRowMainObjectUpdated } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObjectUpdated';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

const renderWithI18n = (node: ReactNode) =>
  render(<I18nProvider i18n={i18n}>{node}</I18nProvider>);

const mainObjectMetadataItem = {
  nameSingular: 'person',
} as EnrichedObjectMetadataItem;

const renderUpdatedEvent = (event: TimelineActivity) =>
  renderWithI18n(
    <EventRowMainObjectUpdated
      authorFullName="John Doe"
      labelIdentifierValue="Mock"
      event={event}
      mainObjectMetadataItem={mainObjectMetadataItem}
      createdAt="2024-01-01"
    />,
  );

describe('EventRowMainObjectUpdated', () => {
  // Regression test: an update event without a usable diff must not throw, since
  // the thrown error bubbles up to the timeline widget error boundary and turns
  // the entire timeline into an "Invalid configuration" fallback.
  it('renders nothing when the update event has no diff property', () => {
    const { container } = renderUpdatedEvent({
      id: '1',
      name: 'person.updated',
      properties: {},
    } as TimelineActivity);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the update event has an empty diff', () => {
    const { container } = renderUpdatedEvent({
      id: '1',
      name: 'person.updated',
      properties: { diff: {} },
    } as TimelineActivity);

    expect(container).toBeEmptyDOMElement();
  });
});
