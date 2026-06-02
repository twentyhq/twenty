import { Injectable } from '@nestjs/common';

import crypto from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type UnsubscribeTokenPayload = {
  workspaceId: string;
  emailAddress: string;
  messageTopicId?: string;
};

@Injectable()
export class UnsubscribeTokenService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  sign(payload: UnsubscribeTokenPayload): string {
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );

    return `${encodedPayload}.${this.computeSignature(encodedPayload)}`;
  }

  verify(token: string): UnsubscribeTokenPayload | null {
    const [encodedPayload, signature] = token.split('.');

    if (!isDefined(encodedPayload) || !isDefined(signature)) {
      return null;
    }

    const expectedSignature = this.computeSignature(encodedPayload);

    if (!this.signaturesMatch(signature, expectedSignature)) {
      return null;
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      );

      if (
        typeof decoded?.workspaceId !== 'string' ||
        typeof decoded?.emailAddress !== 'string'
      ) {
        return null;
      }

      return {
        workspaceId: decoded.workspaceId,
        emailAddress: decoded.emailAddress,
        ...(typeof decoded?.messageTopicId === 'string'
          ? { messageTopicId: decoded.messageTopicId }
          : {}),
      };
    } catch {
      return null;
    }
  }

  private computeSignature(encodedPayload: string): string {
    return crypto
      .createHmac('sha256', this.twentyConfigService.get('APP_SECRET'))
      .update(encodedPayload)
      .digest('base64url');
  }

  private signaturesMatch(candidate: string, expected: string): boolean {
    const candidateBuffer = Buffer.from(candidate);
    const expectedBuffer = Buffer.from(expected);

    if (candidateBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
  }
}
