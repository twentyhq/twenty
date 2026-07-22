import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ObjectType('SdkClientChecksums')
export class SdkClientChecksumsDTO {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  core: string | null;

  @IsString()
  @IsNotEmpty()
  @Field()
  metadata: string;
}
