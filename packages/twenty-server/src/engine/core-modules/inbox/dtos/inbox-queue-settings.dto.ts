import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// The administrator's view of a shared inbox. The reader's view is
// InboxQueueDTO, which carries counts instead of grants.
@ObjectType('InboxQueueSettings')
export class InboxQueueSettingsDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  // The catch-all queue cannot be deleted, which is why the client needs to
  // know which one it is.
  @Field(() => Boolean)
  isDefault: boolean;

  @Field(() => [UUIDScalarType])
  roleIds: string[];
}

@ObjectType('InboxItemTypeSettings')
export class InboxItemTypeSettingsDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  key: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  defaultQueueId: string | null;
}
