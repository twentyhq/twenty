import { registerEnumType } from '@nestjs/graphql';

export enum EmailVerificationTrigger {
  SIGN_UP = 'SIGN_UP',
  EMAIL_UPDATE = 'EMAIL_UPDATE',
}

registerEnumType(EmailVerificationTrigger, {
  name: 'EmailVerificationTrigger',
});
