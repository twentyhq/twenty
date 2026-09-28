import { getTriggerIconColor } from '@/workflow/workflow-trigger/utils/getTriggerIconColor';
import { themeCssVariables } from 'twenty-ui/theme';

describe('getTriggerIconColor', () => {
  it('returns the blue9 css variable for DATABASE_EVENT', () => {
    expect(getTriggerIconColor('DATABASE_EVENT')).toBe(
      themeCssVariables.color.blue9,
    );
  });

  it('returns the purple9 css variable for CRON', () => {
    expect(getTriggerIconColor('CRON')).toBe(themeCssVariables.color.purple9);
  });

  it('returns the purple9 css variable for MANUAL', () => {
    expect(getTriggerIconColor('MANUAL')).toBe(themeCssVariables.color.purple9);
  });

  it('returns the purple9 css variable for WEBHOOK', () => {
    expect(getTriggerIconColor('WEBHOOK')).toBe(
      themeCssVariables.color.purple9,
    );
  });
});
