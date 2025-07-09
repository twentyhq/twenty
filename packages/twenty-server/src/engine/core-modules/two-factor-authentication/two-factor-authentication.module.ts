import { DynamicModule, Global, Provider } from "@nestjs/common";
import { TwoFactorAuthenticationModuleAsyncOptions } from "./two-factor-authentication.interface";
import { TWO_FACTOR_AUTHENTICATION_STRATEGY } from "./two-factor-authentication.constants";
import { HotpStrategy } from "./strategies/hotp.strategy";
import { UserWorkspaceModule } from "../user-workspace/user-workspace.module";
import { DomainManagerModule } from "../domain-manager/domain-manager.module";
import { MetricsModule } from "../metrics/metrics.module";
import { TokenModule } from "../auth/token/token.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { TwoFactorAuthenticationMethod } from "./entities/two-factor-authentication-method.entity";
import { UserWorkspace } from "../user-workspace/user-workspace.entity";
import { TwoFactorAuthenticationService } from "./two-factor-authentication.service";
import { TwoFactorAuthenticationResolver } from "./two-factor-authentication.resolver";
import { TotpStrategy } from "./strategies/totp.strategy";
import { TwoFactorAuthenticationStrategy } from "twenty-shared/types";

@Global()
export class TwoFactorAuthenticationModule {
  static forRoot(options: TwoFactorAuthenticationModuleAsyncOptions): DynamicModule {
    const strategy: Provider = {
      provide: TWO_FACTOR_AUTHENTICATION_STRATEGY,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        switch (config?.type) {
          case TwoFactorAuthenticationStrategy.HOTP: {
            return new HotpStrategy(config.config);
          }
          case TwoFactorAuthenticationStrategy.TOTP: {
            return new TotpStrategy(config.config);
          }
        }
      },
      inject: options.inject || [],
    };

    return {
        module: TwoFactorAuthenticationModule,
        imports: [
          UserWorkspaceModule,
          DomainManagerModule,
          MetricsModule,
          TokenModule,
          TypeOrmModule.forFeature([
              User, 
              TwoFactorAuthenticationMethod, 
              UserWorkspace
          ], 'core'),
        ],
        providers: [
          TwoFactorAuthenticationService,
          TwoFactorAuthenticationResolver,
          strategy
        ],
        exports: [
          TwoFactorAuthenticationService,
        ],
    };
  }
}