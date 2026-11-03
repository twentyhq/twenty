import { ArgsType, Field } from '@nestjs/graphql';
import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class AgentChatThreadRowMetadataArgs {
  @Field(() => [UUIDScalarType])
  @IsArray()
  @ArrayMaxSize(QUERY_MAX_RECORDS)
  @IsUUID('all', { each: true })
  threadIds: string[];
}
