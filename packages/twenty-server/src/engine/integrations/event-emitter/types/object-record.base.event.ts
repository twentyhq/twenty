import { Field, ObjectType } from '@nestjs/graphql';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

@ObjectType()
export class ObjectRecordBaseEvent {
  @Field(() => String)
  name: string;

  @Field(() => String)
  workspaceId: string;

  @Field(() => String)
  recordId: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  workspaceMemberId?: string;

  @Field(() => ObjectMetadataInterface)
  objectMetadata: ObjectMetadataInterface;
  properties: any;
}
