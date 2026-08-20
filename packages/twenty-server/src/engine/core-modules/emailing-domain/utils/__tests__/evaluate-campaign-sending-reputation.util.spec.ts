import { evaluateCampaignSendingReputation } from 'src/engine/core-modules/emailing-domain/utils/evaluate-campaign-sending-reputation.util';

describe('evaluateCampaignSendingReputation', () => {
  it('should not block a workspace that has never sent anything', () => {
    const reputation = evaluateCampaignSendingReputation({
      attemptedCount: 0,
      bouncedCount: 0,
      complainedCount: 0,
    });

    expect(reputation.isSendingBlocked).toBe(false);
    expect(reputation.bounceRate).toBeNull();
    expect(reputation.complaintRate).toBeNull();
  });

  it('should not block on a sample too small for the rates to mean anything', () => {
    const reputation = evaluateCampaignSendingReputation({
      attemptedCount: 2,
      bouncedCount: 1,
      complainedCount: 1,
    });

    expect(reputation.isSendingBlocked).toBe(false);
    expect(reputation.bounceRate).toBeNull();
  });

  it('should block once the bounce rate reaches the threshold on a large enough sample', () => {
    const reputation = evaluateCampaignSendingReputation({
      attemptedCount: 1000,
      bouncedCount: 50,
      complainedCount: 0,
    });

    expect(reputation.bounceRate).toBe(0.05);
    expect(reputation.isSendingBlocked).toBe(true);
  });

  it('should block once the complaint rate reaches the threshold even when nothing bounced', () => {
    const reputation = evaluateCampaignSendingReputation({
      attemptedCount: 1000,
      bouncedCount: 0,
      complainedCount: 3,
    });

    expect(reputation.complaintRate).toBe(0.003);
    expect(reputation.isSendingBlocked).toBe(true);
  });

  it('should allow sending while both rates stay under their thresholds', () => {
    const reputation = evaluateCampaignSendingReputation({
      attemptedCount: 10000,
      bouncedCount: 400,
      complainedCount: 20,
    });

    expect(reputation.isSendingBlocked).toBe(false);
    expect(reputation.bounceRate).toBe(0.04);
    expect(reputation.complaintRate).toBe(0.002);
  });
});
