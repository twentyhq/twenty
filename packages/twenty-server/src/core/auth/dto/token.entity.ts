import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthToken {
  @Field(() => String)
  token: string;

  @Field(() => Date)
  expiresAt: Date;
}

@ObjectType()
export class ApiKeyToken {
  @Field(() => String)
  token: string;
}

@ObjectType()
export class AuthTokenPair {
  @Field(() => AuthToken)
  accessToken: AuthToken;

  @Field(() => AuthToken)
  refreshToken: AuthToken;
}

@ObjectType()
export class AuthTokens {
  @Field(() => AuthTokenPair)
  tokens: AuthTokenPair;
}

@ObjectType()
export class PasswordResetToken {
  @Field(() => String)
  passwordResetToken: string;

  @Field(() => Date)
  passwordResetTokenExpiresAt: Date;
}
