import { i18n } from '@lingui/core';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

import { getTimelineActivityActionSentence } from '@/activities/timeline-activities/rows/utils/getTimelineActivityActionSentence';

beforeEach(() => {
  i18n.load('en', {});
  i18n.activate('en');
});

describe('getTimelineActivityActionSentence', () => {
  it.each([
    ['created', 'created a related company'],
    ['updated', 'updated a related company'],
    ['deleted', 'deleted a related company'],
    ['restored', 'restored a related company'],
    ['linked', 'linked a related company'],
    ['unlinked', 'unlinked a related company'],
  ] satisfies [TimelineActivityAction, string][])(
    'renders the %s action',
    (eventAction, expectedSentence) => {
      expect(
        getTimelineActivityActionSentence({
          eventAction,
          objectNameSingular: 'company',
          timelineActivityTypeLabel: 'Custom label',
        }),
      ).toBe(expectedSentence);
    },
  );

  it('uses the type label when the action is intentionally unset', () => {
    expect(
      getTimelineActivityActionSentence({
        eventAction: null,
        objectNameSingular: 'company',
        timelineActivityTypeLabel: 'qualified',
      }),
    ).toBe('qualified');
  });

  it('uses a neutral fallback when neither action nor label is available', () => {
    expect(
      getTimelineActivityActionSentence({
        eventAction: null,
        objectNameSingular: 'company',
        timelineActivityTypeLabel: null,
      }),
    ).toBe('interacted with a related company');
  });
});
