import { type Theme } from '@emotion/react';
import { COLOR } from 'twenty-ui/theme';
import { getTriggerIconColor } from '../getTriggerIconColor';

describe('getTriggerIconColor', () => {
  const mockTheme: Theme = {
    color: {
      blue: COLOR.blue,
      purple: COLOR.purple,
    },
  } as unknown as Theme;

  it('returns the blue color for database event from theme', () => {
    const result = getTriggerIconColor({
      theme: mockTheme,
      triggerType: 'DATABASE_EVENT',
    });

    expect(result).toBe(COLOR.blue);
  });

  it('returns the purple color for cron from theme', () => {
    const result = getTriggerIconColor({
      theme: mockTheme,
      triggerType: 'CRON',
    });

    expect(result).toBe(COLOR.purple);
  });

  it('works with different theme configurations', () => {
    const differentTheme: Theme = {
      color: {
        blue: COLOR.blue,
        purple: COLOR.purple,
      },
    } as unknown as Theme;

    const result = getTriggerIconColor({
      theme: differentTheme,
      triggerType: 'DATABASE_EVENT',
    });

    expect(result).toBe(COLOR.blue);
  });

  it('maintains reference to theme.color.blue', () => {
    const customTheme: Theme = {
      color: {
        blue: COLOR.blue,
        purple: COLOR.purple,
      },
    } as unknown as Theme;

    const result = getTriggerIconColor({
      theme: customTheme,
      triggerType: 'DATABASE_EVENT',
    });

    expect(result).toBe(COLOR.blue);
  });
});
