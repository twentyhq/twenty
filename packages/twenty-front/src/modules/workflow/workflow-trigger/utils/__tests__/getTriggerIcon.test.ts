import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';

describe('getTriggerIcon', () => {
  it('should return proper Icon for DATABASE_EVENT', () => {
    expect(
      getTriggerIcon({
        type: 'DATABASE_EVENT',
        settings: { eventName: 'company.created', outputSchema: {} },
      }),
    ).toBe('IconPlaylistAdd');
  });

  it('should return proper Icon for MANUAL', () => {
    expect(
      getTriggerIcon({
        type: 'MANUAL',
        settings: { outputSchema: {} },
      }),
    ).toBe('IconHandMove');
  });

  it('should return proper Icon for CRON', () => {
    expect(
      getTriggerIcon({
        type: 'CRON',
        settings: { outputSchema: {}, type: 'CUSTOM', pattern: '' },
      }),
    ).toBe('IconClock');
  });

  it('should return proper Icon for CRON', () => {
    expect(
      getTriggerIcon({
        type: 'WEBHOOK',
        settings: { outputSchema: {}, httpMethod: 'GET', authentication: null },
      }),
    ).toBe('IconWebhook');
  });
});
