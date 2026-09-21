import { getTriggerIconColor } from '@/workflow/workflow-trigger/utils/getTriggerIconColor';
import { themeCssVariables } from 'twenty-ui/theme-constants';

describe('getTriggerIconColor', () => {
  it('returns the blue css variable for DATABASE_EVENT', () => {
    expect(getTriggerIconColor('DATABASE_EVENT')).toBe(
      themeCssVariables.color.blue,
    );
  });

  it('returns the purple css variable for CRON', () => {
    expect(getTriggerIconColor('CRON')).toBe(themeCssVariables.color.purple);
  });

  it('returns the purple css variable for MANUAL', () => {
    expect(getTriggerIconColor('MANUAL')).toBe(themeCssVariables.color.purple);
  });

  it('returns the purple css variable for WEBHOOK', () => {
    expect(getTriggerIconColor('WEBHOOK')).toBe(themeCssVariables.color.purple);
  });
});
