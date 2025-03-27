import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { CaptchaService } from 'src/engine/core-modules/captcha/captcha.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import {
  MeterKeys,
  MetricsCounterKeys,
} from 'src/engine/core-modules/metrics/types/metrics-counter-keys.type';

@Injectable()
export class CaptchaGuard implements CanActivate {
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
    } else {
      await this.metricsService.incrementCounter(
        MetricsCounterKeys.InvalidCaptcha,
        [token],
        MeterKeys.InvalidCaptcha,
      );

      throw new BadRequestException(
        'Invalid Captcha, please try another device',
      );
    }
  }
}
