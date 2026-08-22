import { i18n } from '@lingui/core';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

import { getGenericTimelineActivityActionSentence } from '@/activities/timeline-activities/rows/generic/utils/getGenericTimelineActivityActionSentence';

beforeEach(() => {
  i18n.load('en', {});
  i18n.activate('en');
});

describe('getGenericTimelineActivityActionSentence', () => {
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
        getGenericTimelineActivityActionSentence({
          eventAction,
          objectLabel: 'company',
          timelineActivityTypeLabel: 'Custom label',
        }),
      ).toBe(expectedSentence);
    },
  );

  it('uses the type label when the action is intentionally unset', () => {
    expect(
      getGenericTimelineActivityActionSentence({
        eventAction: null,
        objectLabel: 'company',
        timelineActivityTypeLabel: 'qualified',
      }),
    ).toBe('qualified');
  });

  it('uses a neutral fallback when neither action nor label is available', () => {
    expect(
      getGenericTimelineActivityActionSentence({
        eventAction: null,
        objectLabel: 'company',
        timelineActivityTypeLabel: null,
      }),
    ).toBe('interacted with a related company');
  });
});
