import { buildDefaultCampaignScheduledAt } from '@/activities/emails/utils/buildDefaultCampaignScheduledAt';

describe('buildDefaultCampaignScheduledAt', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('rounds up to the next half hour', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-07T10:07:23.000Z'));

    expect(buildDefaultCampaignScheduledAt()).toEqual(
      new Date('2026-09-07T11:30:00.000Z'),
    );
  });

  it('keeps a lead time of at least an hour when already on a half hour', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-07T10:00:00.000Z'));

    expect(buildDefaultCampaignScheduledAt()).toEqual(
      new Date('2026-09-07T11:00:00.000Z'),
    );
  });

  it('never returns a time in the past', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-07T23:59:59.000Z'));

    expect(buildDefaultCampaignScheduledAt().getTime()).toBeGreaterThan(
      Date.now(),
    );
  });
});
