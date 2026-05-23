import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FileOutputDTO } from 'src/engine/core-modules/file/dtos/file-output.dto';

@ObjectType('PublicApplicationRegistration')
export class PublicApplicationRegistrationDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  name: string;

  @Field(() => FileOutputDTO, { nullable: true })
  logo: FileOutputDTO | null;

  @Field(() => String, { nullable: true })
  websiteUrl: string | null;

  @Field(() => [String])
  oAuthScopes: string[];
}
