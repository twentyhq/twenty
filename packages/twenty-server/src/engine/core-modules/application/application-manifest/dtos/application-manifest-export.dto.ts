import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type Manifest } from 'twenty-shared/application';

@ObjectType('ApplicationManifestExport')
export class ApplicationManifestExportDTO {
  @Field()
  applicationUniversalIdentifier: string;

  @Field(() => GraphQLJSON)
  manifest: Manifest;
}
