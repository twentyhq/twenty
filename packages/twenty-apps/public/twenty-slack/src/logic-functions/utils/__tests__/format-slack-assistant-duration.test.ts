import { describe, expect, it } from 'vitest';

import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

describe('formatSlackAssistantDuration', () => {
  it('should render sub-minute durations in seconds', () => {
    expect(formatSlackAssistantDuration(12_400)).toBe('12s');
  });

  it('should round to the nearest second', () => {
    expect(formatSlackAssistantDuration(1_600)).toBe('2s');
  });

  it('should drop the seconds part on a whole number of minutes', () => {
    expect(formatSlackAssistantDuration(120_000)).toBe('2m');
  });

  it('should render minutes and seconds past a minute', () => {
    expect(formatSlackAssistantDuration(65_000)).toBe('1m 5s');
  });

  it('should never render a negative duration', () => {
    expect(formatSlackAssistantDuration(-500)).toBe('0s');
  });
});
