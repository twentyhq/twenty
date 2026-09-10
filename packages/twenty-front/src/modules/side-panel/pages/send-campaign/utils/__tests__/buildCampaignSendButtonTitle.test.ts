import { buildCampaignSendButtonTitle } from '@/side-panel/pages/send-campaign/utils/buildCampaignSendButtonTitle';

describe('buildCampaignSendButtonTitle', () => {
  it('sends a draft', () => {
    expect(
      buildCampaignSendButtonTitle({
        deliveryTiming: 'NOW',
        isAlreadyScheduled: false,
      }),
    ).toBe('Send campaign');
  });

  it('sends a scheduled campaign ahead of its time', () => {
    expect(
      buildCampaignSendButtonTitle({
        deliveryTiming: 'NOW',
        isAlreadyScheduled: true,
      }),
    ).toBe('Send campaign');
  });

  it('schedules a draft', () => {
    expect(
      buildCampaignSendButtonTitle({
        deliveryTiming: 'LATER',
        isAlreadyScheduled: false,
      }),
    ).toBe('Schedule campaign');
  });

  it('reschedules a campaign that already holds a time', () => {
    expect(
      buildCampaignSendButtonTitle({
        deliveryTiming: 'LATER',
        isAlreadyScheduled: true,
      }),
    ).toBe('Reschedule campaign');
  });
});
