import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { CaptchaService } from 'src/engine/core-modules/captcha/captcha.service';
import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';

import { OPERATIONS_REQUIRING_CAPTCHA } from './constants/operations-requiring-captcha.constants';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(
    private captchaService: CaptchaService,
    private healthCacheService: HealthCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const operationName = info.fieldName;

    if (!OPERATIONS_REQUIRING_CAPTCHA.includes(operationName)) {
      return true;
    }

    const { captchaToken: token } = ctx.getArgs();

    const result = await this.captchaService.validate(token || '');

    if (result.success) {
      return true;
    } else {
      await this.healthCacheService.incrementInvalidCaptchaCounter();

      throw new BadRequestException(
        'Invalid Captcha, please try another device',
      );
    }
  }
}
