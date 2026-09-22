import { CampaignTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/campaign-tracking-token.service';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const PAYLOAD: CampaignTrackingTokenPayload = {
  purpose: 'CLICK',
  deliveryId: '2b77d7dd-3144-4215-aea3-6ce557c60879',
  shortLinkId: 'd0b045ba-2799-4dcb-8d9c-7f4d9674c4ee',
};

const createService = ({
  encryptionKey,
  fallbackEncryptionKey,
}: {
  encryptionKey: string;
  fallbackEncryptionKey?: string;
}) =>
  new CampaignTrackingTokenService({
    get: jest.fn((key: string) => {
      if (key === 'ENCRYPTION_KEY') {
        return encryptionKey;
      }

      if (key === 'FALLBACK_ENCRYPTION_KEY') {
        return fallbackEncryptionKey;
      }

      return undefined;
    }),
  } as unknown as TwentyConfigService);

describe('CampaignTrackingTokenService', () => {
  const service = createService({ encryptionKey: 'primary-key' });

  it('signs a token that verifies to the original delivery and link', () => {
    expect(service.verify(service.sign(PAYLOAD))).toEqual(PAYLOAD);
  });

  it('rejects non-canonical base64url and truncated tokens', () => {
    const token = service.sign(PAYLOAD);

    expect(service.verify(`${token}=`)).toBeNull();
    expect(service.verify(token.slice(0, -1))).toBeNull();
  });

  it('rejects a modified signature and an unknown key id', () => {
    const signed = Buffer.from(service.sign(PAYLOAD), 'base64url');
    const wrongSignature = Buffer.from(signed);
    const unknownKeyId = Buffer.from(signed);

    wrongSignature[wrongSignature.length - 1] ^= 1;
    unknownKeyId[1] ^= 1;

    expect(service.verify(wrongSignature.toString('base64url'))).toBeNull();
    expect(service.verify(unknownKeyId.toString('base64url'))).toBeNull();
  });

  it('verifies an old token while its signing key is configured as fallback', () => {
    const oldService = createService({ encryptionKey: 'old-key' });
    const rotatedService = createService({
      encryptionKey: 'new-key',
      fallbackEncryptionKey: 'old-key',
    });

    expect(rotatedService.verify(oldService.sign(PAYLOAD))).toEqual(PAYLOAD);
  });
});
