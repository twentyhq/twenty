import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@ObjectType()
export class FocusNfeIntegrationPublicDto {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  integrationName?: string;

  @Field({ defaultValue: 'active' })
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Workspace, { nullable: true })
  workspace?: Workspace;
}
