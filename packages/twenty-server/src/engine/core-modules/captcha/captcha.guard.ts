import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';

import {
  CaptchaException,
  CaptchaExceptionCode,
} from 'src/engine/core-modules/captcha/captcha.exception';
import { CaptchaService } from 'src/engine/core-modules/captcha/captcha.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

@Injectable()
export class CaptchaGuard implements CanActivate {
  private readonly logger = new Logger(CaptchaGuard.name);

  constructor(
    private captchaService: CaptchaService,
    private metricsService: MetricsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const { captchaToken: token } = ctx.getArgs();

    const result = await this.captchaService.validate(token || '');

    if (result.success) {
      return true;
    }

    if (result.error?.startsWith('captcha-provider-unreachable')) {
      this.logger.warn(
        `Captcha provider unreachable: ${result.error}`,
      );
    }

    await this.metricsService.incrementCounter({
      key: MetricsKeys.InvalidCaptcha,
      eventId: token || '',
      ...(result.error ? { attributes: { error: result.error } } : {}),
    });

    throw new CaptchaException(
      'Invalid Captcha, please try another device',
      CaptchaExceptionCode.INVALID_CAPTCHA,
      {
        userFriendlyMessage: msg`Invalid Captcha, please try another device`,
      },
    );
  }
}
