import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

@ObjectType('IframeConfiguration')
export class IframeConfigurationDTO {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
