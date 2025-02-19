/* @license Enterprise */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { timingSafeEqual } from 'crypto';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class CloudflareSecretMatchGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest<Request>();

      const cloudflareWebhookSecret = this.environmentService.get(
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
