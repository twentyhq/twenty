import { buildCampaignSendButtonTitle } from '@/activities/emails/utils/buildCampaignSendButtonTitle';

describe('buildCampaignSendButtonTitle', () => {
  it('sends a draft', () => {
    expect(
      buildCampaignSendButtonTitle({
        deliveryTiming: 'NOW',
        isAlreadyScheduled: false,
      }),
    ).toBe('Send Campaign');
  });

  it('sends a scheduled campaign ahead of its time', () => {
    expect(
      buildCampaignSendButtonTitle({
        deliveryTiming: 'NOW',
        isAlreadyScheduled: true,
      }),
    ).toBe('Send Now');
  });

  it('schedules a draft', () => {
    expect(
      buildCampaignSendButtonTitle({
        deliveryTiming: 'LATER',
        isAlreadyScheduled: false,
      }),
    ).toBe('Schedule Campaign');
  });

  it('reschedules a campaign that already holds a time', () => {
    expect(
      buildCampaignSendButtonTitle({
        deliveryTiming: 'LATER',
        isAlreadyScheduled: true,
      }),
    ).toBe('Reschedule Campaign');
  });
});
