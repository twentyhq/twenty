import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateWorkspaceSchemaInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  domainName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  displayName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  logo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  inviteHash?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  allowImpersonation?: boolean;
}
