import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { isBreakGlassEmail } from 'src/engine/core-modules/auth/utils/is-break-glass-email.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type ResolverArgs = Record<string, unknown> & {
  email?: unknown;
  loginToken?: unknown;
};

// Closes the password backdoor: AUTH_PASSWORD_ENABLED=false only hides the
// password form in the UI, while the password mutations below stayed callable
// through GraphQL. With the flag off, the mutations guarded by this class are
// rejected unless the caller's email is on the AUTH_BREAK_GLASS_EMAILS
// allowlist (the break-glass used with /welcome?direct=1 while the DOS ID
// provider is unreachable). With the flag on (the default), the guard is a
// no-op.
@Injectable()
export class PasswordAuthEnabledGuard implements CanActivate {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly loginTokenService: LoginTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.twentyConfigService.get('AUTH_PASSWORD_ENABLED')) {
      return true;
    }

    const email = await this.resolveEmail(context);

    if (
      isDefined(email) &&
      isBreakGlassEmail(
        email,
        this.twentyConfigService.get('AUTH_BREAK_GLASS_EMAILS'),
      )
    ) {
      return true;
    }

    throw new AuthException(
      'Password authentication is disabled',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
    );
  }

  private async resolveEmail(
    context: ExecutionContext,
  ): Promise<string | undefined> {
    const args = GqlExecutionContext.create(context).getArgs<ResolverArgs>();

    if (isNonEmptyString(args?.email)) {
      return args.email;
    }

    if (isNonEmptyString(args?.loginToken)) {
      // The OTP exchange carries no email, only the loginToken minted by an
      // already-guarded mutation. A failed verification throws, so a forged
      // token cannot smuggle an allowlisted email past the resolver.
      try {
        const payload = await this.loginTokenService.verifyLoginToken(
          args.loginToken,
        );

        return payload.sub;
      } catch {
        return undefined;
      }
    }

    return undefined;
  }
}
