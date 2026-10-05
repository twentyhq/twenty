import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { type RunAgentThread } from 'twenty-shared/application';

@InputType('RunAgentThreadInput')
export class RunAgentThreadInputDTO implements RunAgentThread {
  @IsString()
  @IsNotEmpty()
  @Field()
  key: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field({ nullable: true })
  title?: string;
}
