import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { OutboundMessageDomainDriver } from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';

@InputType()
export class CreateOutboundMessageDomainInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  domain: string;

  @Field(() => OutboundMessageDomainDriver)
  @IsEnum(OutboundMessageDomainDriver)
  @IsNotEmpty()
  driver: OutboundMessageDomainDriver;

  @Field(() => String, { nullable: true })
  @IsObject()
  @IsOptional()
  driverConfig?: Record<string, unknown>;
}
