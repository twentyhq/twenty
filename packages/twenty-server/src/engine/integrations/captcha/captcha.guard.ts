import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { CaptchaService } from 'src/engine/integrations/captcha/captcha.service';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private captchaService: CaptchaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const { captchaToken: token } = ctx.getArgs();

    const result = await this.captchaService.validate(token || '');

    if (result.success) return true;
    else
      throw new HttpException(
        result?.error ?? 'Invalid Captcha, please try again',
        HttpStatus.BAD_REQUEST,
      );
  }
}
