import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAPIsOauthGuard extends AuthGuard('google-apis') {
  constructor() {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const transientToken = request.query.transientToken;
    const redirectLocation = request.query.redirectLocation;

    if (transientToken && typeof transientToken === 'string') {
      request.params.transientToken = transientToken;
    }

    if (redirectLocation && typeof redirectLocation === 'string') {
      request.params.redirectLocation = redirectLocation;
    }

    const activate = (await super.canActivate(context)) as boolean;

    return activate;
  }
}
