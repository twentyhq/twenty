import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('InboxThreadRecordInput')
export class InboxThreadRecordInputDTO {
  @IsUUID()
  @Field(() => UUIDScalarType)
  threadId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  objectNameSingular: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  recordId: string;
}
