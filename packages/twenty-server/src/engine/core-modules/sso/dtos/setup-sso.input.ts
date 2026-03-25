/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsX509Certificate } from 'src/engine/core-modules/sso/dtos/validators/x509.validator';

@InputType()
class SetupSsoInputCommon {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  issuer: string;
}

@InputType()
export class SetupOIDCSsoInput extends SetupSsoInputCommon {
  @Field(() => String)
  @IsString()
  clientID: string;

  @Field(() => String)
  @IsString()
  clientSecret: string;
}

@InputType()
export class SetupSAMLSsoInput extends SetupSsoInputCommon {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsUrl({ protocols: ['http', 'https'] })
  ssoURL: string;

  @Field(() => String)
  @IsX509Certificate()
  certificate: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fingerprint?: string;
}
