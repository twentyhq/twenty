import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';

import { IsX509Certificate } from 'src/engine/core-modules/sso/dtos/validators/x509.validator';

@InputType()
class SetupSsoInputCommon {
  @Field(() => String)
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String)
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  issuer: string;
}

@InputType()
export class SetupOIDCSsoInput extends SetupSsoInputCommon {
  @Field(() => String)
  @IsUrl({ protocols: ['http', 'https'] })
  authorizationURL: string;

  @Field(() => String)
  @IsUrl({ protocols: ['http', 'https'] })
  tokenURL: string;

  @Field(() => String)
  @IsString()
  clientID: string;

  @Field(() => String)
  @IsString()
  clientSecret: string;

  @Field(() => String)
  @IsUrl({ protocols: ['http', 'https'] })
  callbackURL: string;
}

@InputType()
export class SetupSAMLSsoInput extends SetupSsoInputCommon {
  @Field(() => String)
  @IsUrl({ protocols: ['http', 'https'] })
  ssoURL: string;

  @Field(() => String)
  @IsX509Certificate()
  certificate: string;

  @Field(() => String)
  @IsOptional()
  @IsString()
  fingerprint?: string;
}
