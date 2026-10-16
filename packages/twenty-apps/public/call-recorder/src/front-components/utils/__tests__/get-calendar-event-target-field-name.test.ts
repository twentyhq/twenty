import { describe, expect, it } from 'vitest';

import { getCalendarEventTargetFieldName } from 'src/front-components/utils/get-calendar-event-target-field-name.util';

describe('getCalendarEventTargetFieldName', () => {
  it.each([
    ['person', 'targetPersonId'],
    ['company', 'targetCompanyId'],
    ['opportunity', 'targetOpportunityId'],
  ])('maps %s to %s', (objectNameSingular, calendarEventTargetFieldName) => {
    expect(getCalendarEventTargetFieldName(objectNameSingular)).toBe(
      calendarEventTargetFieldName,
    );
  });

  it.each([undefined, 'callRecording', 'task', 'constructor'])(
    'does not support %j',
    (objectNameSingular) => {
      expect(
        getCalendarEventTargetFieldName(objectNameSingular),
      ).toBeUndefined();
    },
  );
});
