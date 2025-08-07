/* @license Enterprise */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { timingSafeEqual } from 'crypto';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class CloudflareSecretMatchGuard implements CanActivate {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context
        .switchToHttp()
        .getRequest<
          Request & { headers: Record<string, string | string[] | undefined> }
        >();

      const cloudflareWebhookSecret = this.twentyConfigService.get(
        'CLOUDFLARE_WEBHOOK_SECRET',
      );

      const cfWebhookAuth = request.headers['cf-webhook-auth'];
      const authHeader = Array.isArray(cfWebhookAuth)
        ? cfWebhookAuth[0]
        : cfWebhookAuth;

      if (
        !cloudflareWebhookSecret ||
        (cloudflareWebhookSecret &&
          authHeader &&
          typeof authHeader === 'string' &&
          timingSafeEqual(
            Buffer.from(authHeader),
            Buffer.from(cloudflareWebhookSecret),
          ))
      ) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
