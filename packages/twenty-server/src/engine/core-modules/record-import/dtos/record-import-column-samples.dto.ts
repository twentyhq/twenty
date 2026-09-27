import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType('RecordImportColumnSamples')
export class RecordImportColumnSamplesDTO {
  @Field(() => [String])
  headerValues: string[];

  @Field(() => GraphQLJSON)
  exampleRows: string[][];

  // Distinct non-empty values per column, capped, for option matching
  @Field(() => GraphQLJSON)
  distinctValuesByColumn: string[][];
}
