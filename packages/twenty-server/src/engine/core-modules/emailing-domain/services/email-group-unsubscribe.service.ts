import { Injectable } from '@nestjs/common';

import { createHmac, timingSafeEqual } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type UnsubscribeTokenPayload = {
  workspaceId: string;
  emailAddress: string;
};

type EmailHeader = {
  name: string;
  value: string;
};

@Injectable()
export class EmailGroupUnsubscribeService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  buildUnsubscribeHeaders(
    workspaceId: string,
    emailAddress: string,
  ): EmailHeader[] {
    const token = this.signToken({ workspaceId, emailAddress });
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const unsubscribeUrl = `${serverUrl}/emailing/unsubscribe?token=${encodeURIComponent(token)}`;

    return [
      { name: 'List-Unsubscribe', value: `<${unsubscribeUrl}>` },
      { name: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' },
    ];
  }

  verifyToken(token: string): UnsubscribeTokenPayload | null {
    const [encodedPayload, signature] = token.split('.');

    if (!isDefined(encodedPayload) || !isDefined(signature)) {
      return null;
    }

    const expectedSignature = this.computeSignature(encodedPayload);

    if (!isSignatureEqual(signature, expectedSignature)) {
      return null;
    }

    const payload = parsePayload(encodedPayload);

    if (!isValidPayload(payload)) {
      return null;
    }

    return payload;
  }

  private signToken(payload: UnsubscribeTokenPayload): string {
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    return `${encodedPayload}.${this.computeSignature(encodedPayload)}`;
  }

  private computeSignature(encodedPayload: string): string {
    return createHmac('sha256', this.twentyConfigService.get('APP_SECRET'))
      .update(encodedPayload)
      .digest('base64url');
  }
}

const base64UrlEncode = (value: string): string =>
  Buffer.from(value, 'utf8').toString('base64url');

const parsePayload = (encodedPayload: string): unknown => {
  try {
    return JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    );
  } catch {
    return null;
  }
};

const isValidPayload = (payload: unknown): payload is UnsubscribeTokenPayload =>
  isDefined(payload) &&
  typeof (payload as UnsubscribeTokenPayload).workspaceId === 'string' &&
  typeof (payload as UnsubscribeTokenPayload).emailAddress === 'string';

const isSignatureEqual = (candidate: string, expected: string): boolean => {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
};
