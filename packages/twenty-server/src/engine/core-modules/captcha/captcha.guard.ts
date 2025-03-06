import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { CaptchaService } from 'src/engine/core-modules/captcha/captcha.service';
import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(
    private captchaService: CaptchaService,
    private healthCacheService: HealthCacheService,
    private exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const { captchaToken: token } = ctx.getArgs();

    const result = await this.captchaService.validate(token || '');

    if (result.success) {
      return true;
    } else {
      await this.healthCacheService.incrementInvalidCaptchaCounter();

      // remove me when
      this.exceptionHandlerService.captureExceptions([
        new Error(`Invalid Captcha: ${result.error}`),
      ]);

      throw new BadRequestException(
        'Invalid Captcha, please try another device',
      );
    }
  }
}
