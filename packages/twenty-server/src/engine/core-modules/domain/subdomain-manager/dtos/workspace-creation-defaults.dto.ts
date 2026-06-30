import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceCreationDefaultsDTO {
  @Field(() => String)
  displayName: string;

  @Field(() => String)
  subdomain: string;
}
