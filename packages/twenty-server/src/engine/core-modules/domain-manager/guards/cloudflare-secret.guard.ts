/* @license Enterprise */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { timingSafeEqual } from 'crypto';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class CloudflareSecretMatchGuard implements CanActivate {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest<Request>();

      const cloudflareWebhookSecret = this.twentyConfigService.get(
        'CLOUDFLARE_WEBHOOK_SECRET',
      );

      if (
        !cloudflareWebhookSecret ||
        (cloudflareWebhookSecret &&
          (typeof request.headers['cf-webhook-auth'] === 'string' ||
            timingSafeEqual(
              Buffer.from(request.headers['cf-webhook-auth']),
              Buffer.from(cloudflareWebhookSecret),
            )))
      ) {
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }
}
