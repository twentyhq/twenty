import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType('SdkClientChecksums')
export class SdkClientChecksumsDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  core: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  metadata: string;
}
