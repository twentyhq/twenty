import { buildCampaignDeliveryHint } from '@/side-panel/pages/send-campaign/utils/buildCampaignDeliveryHint';

describe('buildCampaignDeliveryHint', () => {
  it('warns that an immediate send cannot be undone', () => {
    expect(
      buildCampaignDeliveryHint({
        deliveryTiming: 'NOW',
        isAlreadyScheduled: false,
        formattedSendTime: null,
      }),
    ).toBe('Sending starts right away and cannot be undone.');
  });

  it('warns that an immediate send overtakes the time already held', () => {
    expect(
      buildCampaignDeliveryHint({
        deliveryTiming: 'NOW',
        isAlreadyScheduled: true,
        formattedSendTime: 'Sep 7, 2026 6:00 PM GMT+2',
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
        formattedSendTime: null,
      }),
    ).toBe('Pick a send time in the future.');
  });

  it('names the send time it will start at', () => {
    expect(
      buildCampaignDeliveryHint({
        deliveryTiming: 'LATER',
        isAlreadyScheduled: false,
        formattedSendTime: 'Sep 7, 2026 6:00 PM GMT+2',
      }),
    ).toBe(
      'Sending starts Sep 7, 2026 6:00 PM GMT+2. You can cancel before then.',
    );
  });
});
