import { TwoFactorAuthenticationStrategy } from "twenty-shared/types";
import { OTPContext } from "../two-factor-authentication.interface";

export interface ITwoFactorAuthStrategy {
    readonly name: TwoFactorAuthenticationStrategy;
    initiate(accountName: string, issuer: string, counter: number): {
      uri: string,
      context: OTPContext
    };
    validate(token: string, context: OTPContext): {
      isValid: boolean,
      context: OTPContext 
    };
}