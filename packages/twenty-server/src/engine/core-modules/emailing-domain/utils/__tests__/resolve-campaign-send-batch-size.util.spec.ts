import { CAMPAIGN_SEND_BATCH_SIZE } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-batch-size.constant';
import { resolveCampaignSendBatchSize } from 'src/engine/core-modules/emailing-domain/utils/resolve-campaign-send-batch-size.util';

const computeMessagesPerWindow = (configuredEmailSendRateLimit: number) => {
  const batchSize = resolveCampaignSendBatchSize(configuredEmailSendRateLimit);

  return batchSize * Math.floor(configuredEmailSendRateLimit / batchSize);
};

describe('resolveCampaignSendBatchSize', () => {
  it('should cap the batch at the provider ceiling when the limit is higher', () => {
    expect(resolveCampaignSendBatchSize(100)).toBe(CAMPAIGN_SEND_BATCH_SIZE);
  });

  it('should use the ceiling when the limit equals it', () => {
    expect(resolveCampaignSendBatchSize(CAMPAIGN_SEND_BATCH_SIZE)).toBe(
      CAMPAIGN_SEND_BATCH_SIZE,
    );
  });

  it('should shrink the batch to the limit when the limit is below the ceiling', () => {
    expect(resolveCampaignSendBatchSize(10)).toBe(10);
  });

  it('should send one message per batch when the limit is one', () => {
    expect(resolveCampaignSendBatchSize(1)).toBe(1);
  });

  it('should still return a sendable batch size when the limit is zero', () => {
    expect(resolveCampaignSendBatchSize(0)).toBe(1);
  });

  it('should never let a window carry more messages than the configured limit', () => {
    for (const configuredEmailSendRateLimit of [
      1, 2, 10, 49, 50, 75, 100, 500,
    ]) {
      expect(
        computeMessagesPerWindow(configuredEmailSendRateLimit),
      ).toBeLessThanOrEqual(configuredEmailSendRateLimit);
    }
  });

  it('should let the default configuration send its full budget per window', () => {
    expect(computeMessagesPerWindow(100)).toBe(100);
  });

  it('should send exactly the configured budget when the limit is below the ceiling', () => {
    expect(computeMessagesPerWindow(10)).toBe(10);
  });
});
