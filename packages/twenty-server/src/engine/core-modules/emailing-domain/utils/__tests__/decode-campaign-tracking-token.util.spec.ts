import { decodeCampaignTrackingToken } from 'src/engine/core-modules/emailing-domain/utils/decode-campaign-tracking-token.util';
import { encodeCampaignTrackingToken } from 'src/engine/core-modules/emailing-domain/utils/encode-campaign-tracking-token.util';

const PAYLOAD = {
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  deliveryId: '8f3c9a1e-7b2d-4c1a-9e0f-1234567890ab',
  shortLinkId: 'c4d2e6f8-1a2b-4c3d-8e9f-abcdef123456',
};

describe('decodeCampaignTrackingToken', () => {
  it('should give back the identifiers that were encoded', () => {
    const token = encodeCampaignTrackingToken(PAYLOAD);

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeCampaignTrackingToken(token)).toEqual(PAYLOAD);
  });

  it('should reject a token that does not hold three uuids', () => {
    expect(
      decodeCampaignTrackingToken(
        Buffer.from(`${PAYLOAD.workspaceId}.${PAYLOAD.deliveryId}`).toString(
          'base64url',
        ),
      ),
    ).toBeNull();
    expect(
      decodeCampaignTrackingToken(
        Buffer.from(
          `${PAYLOAD.workspaceId}.${PAYLOAD.deliveryId}.not-a-uuid`,
        ).toString('base64url'),
      ),
    ).toBeNull();
    expect(
      decodeCampaignTrackingToken(
        Buffer.from(
          `${PAYLOAD.workspaceId}.${PAYLOAD.deliveryId}.${PAYLOAD.shortLinkId}.${PAYLOAD.shortLinkId}`,
        ).toString('base64url'),
      ),
    ).toBeNull();
  });

  it('should reject a token that is not canonical base64url', () => {
    const token = encodeCampaignTrackingToken(PAYLOAD);

    expect(decodeCampaignTrackingToken(`${token}=`)).toBeNull();
    expect(decodeCampaignTrackingToken(`${token}a`)).toBeNull();
  });
});
