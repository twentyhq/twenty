import { STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/timeline';

import { getStandardTimelineActivityRenderer } from '@/activities/timeline-activities/rows/components/StandardTimelineActivityRenderer';

describe('getStandardTimelineActivityRenderer', () => {
  it.each(
    Object.values(STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS),
  )('resolves the standard renderer %s', (universalIdentifier) => {
    expect(
      getStandardTimelineActivityRenderer(universalIdentifier),
    ).not.toBeNull();
  });

  it('does not resolve unknown renderer identifiers', () => {
    expect(
      getStandardTimelineActivityRenderer(
        '00000000-0000-4000-8000-000000000001',
      ),
    ).toBeNull();
  });
});
