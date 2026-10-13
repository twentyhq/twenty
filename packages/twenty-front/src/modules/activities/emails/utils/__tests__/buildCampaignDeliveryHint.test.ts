import { buildCampaignDeliveryHint } from '@/activities/emails/utils/buildCampaignDeliveryHint';

describe('buildCampaignDeliveryHint', () => {
  it('warns that an immediate send cannot be undone', () => {
    expect(
      buildCampaignDeliveryHint({
        deliveryTiming: 'NOW',
        isAlreadyScheduled: false,
        hasValidSendTime: false,
      }),
    ).toBe('Sending starts right away and cannot be undone.');
  });

  it('warns that an immediate send overtakes the time already held', () => {
    expect(
      buildCampaignDeliveryHint({
        deliveryTiming: 'NOW',
        isAlreadyScheduled: true,
        hasValidSendTime: true,
      }),
    ).toBe(
      'Sending starts right away, ahead of the time this campaign is holding.',
    );
  });

  it('asks for a send time when none is usable', () => {
    expect(
      buildCampaignDeliveryHint({
        deliveryTiming: 'LATER',
        isAlreadyScheduled: false,
        hasValidSendTime: false,
      }),
    ).toBe('Pick a send time in the future.');
  });

  it('explains what happens before a scheduled send', () => {
    expect(
      buildCampaignDeliveryHint({
        deliveryTiming: 'LATER',
        isAlreadyScheduled: false,
        hasValidSendTime: true,
      }),
    ).toBe('Recipients are recounted at send time. You can cancel until then.');
  });
});
