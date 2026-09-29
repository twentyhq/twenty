import { decodeCampaignOpenTrackingToken } from 'src/engine/core-modules/emailing-domain/utils/decode-campaign-open-tracking-token.util';
import { decodeCampaignTrackingToken } from 'src/engine/core-modules/emailing-domain/utils/decode-campaign-tracking-token.util';
import { encodeCampaignOpenTrackingToken } from 'src/engine/core-modules/emailing-domain/utils/encode-campaign-open-tracking-token.util';
import { encodeCampaignTrackingToken } from 'src/engine/core-modules/emailing-domain/utils/encode-campaign-tracking-token.util';

const PAYLOAD = {
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  deliveryId: '8f3c9a1e-7b2d-4c1a-9e0f-1234567890ab',
};

describe('decodeCampaignOpenTrackingToken', () => {
  it('should give back the identifiers that were encoded', () => {
    const token = encodeCampaignOpenTrackingToken(PAYLOAD);

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeCampaignOpenTrackingToken(token)).toEqual(PAYLOAD);
  });

  it('should not accept a click token, nor let a click route accept an open token', () => {
    const clickToken = encodeCampaignTrackingToken({
      ...PAYLOAD,
      shortLinkId: 'c4d2e6f8-1a2b-4c3d-8e9f-abcdef123456',
    });

    expect(decodeCampaignOpenTrackingToken(clickToken)).toBeNull();
    expect(
      decodeCampaignTrackingToken(encodeCampaignOpenTrackingToken(PAYLOAD)),
    ).toBeNull();
  });

  it('should reject a token that does not hold two uuids', () => {
    expect(
      decodeCampaignOpenTrackingToken(
        Buffer.from(`${PAYLOAD.workspaceId}.not-a-uuid`).toString('base64url'),
      ),
    ).toBeNull();
  });

  it('should reject a token that is not canonical base64url', () => {
    const token = encodeCampaignOpenTrackingToken(PAYLOAD);

    expect(decodeCampaignOpenTrackingToken(`${token}=`)).toBeNull();
    expect(decodeCampaignOpenTrackingToken(`${token}a`)).toBeNull();
  });
});
