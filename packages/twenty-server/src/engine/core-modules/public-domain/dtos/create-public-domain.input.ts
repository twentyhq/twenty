import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class CreatePublicDomainInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  domain: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  applicationId?: string | null;
}
