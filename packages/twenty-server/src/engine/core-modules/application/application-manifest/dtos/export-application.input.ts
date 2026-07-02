import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class ExportApplicationInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;
}
