import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { isSuppressionBlockingSend } from 'src/engine/core-modules/emailing-domain/utils/is-suppression-blocking-send.util';

const NEWSLETTER_TOPIC_ID = '11111111-1111-4111-8111-111111111111';
const PRODUCT_TOPIC_ID = '22222222-2222-4222-8222-222222222222';

describe('isSuppressionBlockingSend', () => {
  describe.each([
    MessageSuppressionReason.BOUNCE,
    MessageSuppressionReason.COMPLAINT,
  ])('hard suppression (%s)', (reason) => {
    it('should block a marketing send', () => {
      expect(
        isSuppressionBlockingSend({
          sendKind: 'MARKETING',
          suppression: { reason, unsubscribeTopicId: null },
          unsubscribeTopicId: NEWSLETTER_TOPIC_ID,
        }),
      ).toBe(true);
    });

    it('should block a transactional send, because a dead or hostile address is dead for all mail', () => {
      expect(
        isSuppressionBlockingSend({
          sendKind: 'TRANSACTIONAL',
          suppression: { reason, unsubscribeTopicId: null },
        }),
      ).toBe(true);
    });
  });

  describe('unsubscribe from all', () => {
    const suppression = {
      reason: MessageSuppressionReason.UNSUBSCRIBE,
      unsubscribeTopicId: null,
    };

    it('should block a marketing send carrying no topic', () => {
      expect(
        isSuppressionBlockingSend({ sendKind: 'MARKETING', suppression }),
      ).toBe(true);
    });

    it('should block a marketing send carrying any topic', () => {
      expect(
        isSuppressionBlockingSend({
          sendKind: 'MARKETING',
          suppression,
          unsubscribeTopicId: NEWSLETTER_TOPIC_ID,
        }),
      ).toBe(true);
    });

    it('should let a transactional reply through', () => {
      expect(
        isSuppressionBlockingSend({ sendKind: 'TRANSACTIONAL', suppression }),
      ).toBe(false);
    });
  });

  describe('topic opt-out', () => {
    const suppression = {
      reason: MessageSuppressionReason.UNSUBSCRIBE,
      unsubscribeTopicId: NEWSLETTER_TOPIC_ID,
    };

    it('should block a marketing send on the same topic', () => {
      expect(
        isSuppressionBlockingSend({
          sendKind: 'MARKETING',
          suppression,
          unsubscribeTopicId: NEWSLETTER_TOPIC_ID,
        }),
      ).toBe(true);
    });

    it('should let a marketing send on another topic through', () => {
      expect(
        isSuppressionBlockingSend({
          sendKind: 'MARKETING',
          suppression,
          unsubscribeTopicId: PRODUCT_TOPIC_ID,
        }),
      ).toBe(false);
    });

    it('should let a marketing send carrying no topic through', () => {
      expect(
        isSuppressionBlockingSend({ sendKind: 'MARKETING', suppression }),
      ).toBe(false);
    });

    it('should let a transactional reply through', () => {
      expect(
        isSuppressionBlockingSend({ sendKind: 'TRANSACTIONAL', suppression }),
      ).toBe(false);
    });
  });
});
