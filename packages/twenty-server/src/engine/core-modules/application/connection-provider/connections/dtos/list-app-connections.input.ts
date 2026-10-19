import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountScopeEnum } from 'src/engine/metadata-modules/connected-account/enums/connected-account-scope.enum';

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

  @IsEnum(ConnectedAccountScopeEnum)
  @IsOptional()
  @Field(() => ConnectedAccountScopeEnum, { nullable: true })
  scope?: ConnectedAccountScope;

  @IsIn(['user', 'workspace'])
  @IsOptional()
  @Field(() => String, {
    nullable: true,
    deprecationReason: 'Use scope instead.',
  })
  visibility?: 'user' | 'workspace';
}
