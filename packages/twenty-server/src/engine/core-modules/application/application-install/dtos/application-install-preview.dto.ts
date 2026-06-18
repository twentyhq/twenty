import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';
import { type Manifest } from 'twenty-shared/application';

@ObjectType('ApplicationInstallPreview')
export class ApplicationInstallPreviewDTO {
  @Field(() => GraphQLJSON)
  manifest: Manifest;
}
