import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType('MarketplaceAppObject')
export class MarketplaceAppObjectDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  labelSingular: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  labelPlural: string;
}
