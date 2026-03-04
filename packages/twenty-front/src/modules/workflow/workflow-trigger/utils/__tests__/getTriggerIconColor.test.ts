import { COLOR_LIGHT, type ThemeType } from 'twenty-ui/theme';
import { getTriggerIconColor } from '@/workflow/workflow-trigger/utils/getTriggerIconColor';

describe('getTriggerIconColor', () => {
  const mockTheme: ThemeType = {
    color: {
      blue: COLOR_LIGHT.blue,
      purple: COLOR_LIGHT.purple,
    },
  } as unknown as ThemeType;

  it('returns the blue color for database event from theme', () => {
    const result = getTriggerIconColor({
      theme: mockTheme,
      triggerType: 'DATABASE_EVENT',
    });

    expect(result).toBe(COLOR_LIGHT.blue);
  });

  it('returns the purple color for cron from theme', () => {
    const result = getTriggerIconColor({
      theme: mockTheme,
      triggerType: 'CRON',
    });

    expect(result).toBe(COLOR_LIGHT.purple);
  });

  it('works with different theme configurations', () => {
    const differentTheme: ThemeType = {
      color: {
        blue: COLOR_LIGHT.blue,
        purple: COLOR_LIGHT.purple,
      },
    } as unknown as ThemeType;

    const result = getTriggerIconColor({
      theme: differentTheme,
      triggerType: 'DATABASE_EVENT',
    });

    expect(result).toBe(COLOR_LIGHT.blue);
  });

  it('maintains reference to theme.color.blue', () => {
    const customTheme: ThemeType = {
      color: {
        blue: COLOR_LIGHT.blue,
        purple: COLOR_LIGHT.purple,
      },
    } as unknown as ThemeType;

    const result = getTriggerIconColor({
      theme: customTheme,
      triggerType: 'DATABASE_EVENT',
    });

    expect(result).toBe(COLOR_LIGHT.blue);
  });
});
