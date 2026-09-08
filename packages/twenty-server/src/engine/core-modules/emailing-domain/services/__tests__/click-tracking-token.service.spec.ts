import { Test, type TestingModule } from '@nestjs/testing';

import { CLICK_TRACKING_TOKEN_FORMAT } from 'src/engine/core-modules/emailing-domain/constants/click-tracking-token.constant';
import { ClickTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/click-tracking-token.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const PAYLOAD = {
  messageCampaignLinkId: '6f1b5c2e-6a52-4a6e-9a1f-2c5f7b9d4e31',
  messageId: 'b3d7c9a1-4e28-4f6b-8c05-1d2e3f4a5b6c',
};

const buildService = async (appSecret: string) => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ClickTrackingTokenService,
      { provide: TwentyConfigService, useValue: { get: () => appSecret } },
    ],
  }).compile();

  return module.get(ClickTrackingTokenService);
};

describe('ClickTrackingTokenService', () => {
  it('round trips the link and message ids', async () => {
    const service = await buildService('app-secret');

    expect(service.verify(service.sign(PAYLOAD))).toEqual(PAYLOAD);
  });

  it('produces a token matching the format the controller accepts', async () => {
    const service = await buildService('app-secret');

    expect(service.sign(PAYLOAD)).toMatch(CLICK_TRACKING_TOKEN_FORMAT);
  });

  it('rejects a token whose payload was tampered with', async () => {
    const service = await buildService('app-secret');
    const token = service.sign(PAYLOAD);
    const tampered = `${token.slice(0, 4) === 'AAAA' ? 'BBBB' : 'AAAA'}${token.slice(4)}`;

    expect(service.verify(tampered)).toBeNull();
  });

  it('rejects a token signed with a different app secret', async () => {
    const signer = await buildService('app-secret');
    const verifier = await buildService('other-secret');

    expect(verifier.verify(signer.sign(PAYLOAD))).toBeNull();
  });

  it('rejects a token of the wrong length', async () => {
    const service = await buildService('app-secret');

    expect(service.verify('too-short')).toBeNull();
  });
});
