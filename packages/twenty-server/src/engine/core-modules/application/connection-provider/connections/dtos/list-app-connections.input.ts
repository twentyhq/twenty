import { Field, InputType } from '@nestjs/graphql';

import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType('ListAppConnectionsInput')
export class ListAppConnectionsInput {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  providerName?: string;

  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  userWorkspaceId?: string;

  @IsIn(['user', 'workspace'])
  @IsOptional()
  @Field(() => String, { nullable: true })
  visibility?: 'user' | 'workspace';
}
