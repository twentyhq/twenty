import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ObjectType('MarketplaceAppPermissionFlag')
export class MarketplaceAppPermissionFlagDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  icon?: string | null;
}
