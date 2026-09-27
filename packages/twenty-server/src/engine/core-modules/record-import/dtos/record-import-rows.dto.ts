import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType('RecordImportRowsPage')
export class RecordImportRowsPageDTO {
  @Field(() => Int)
  totalCount: number;

  // [{ rowNumber, values: { [fieldKey]: value }, errors: { [fieldKey]: { level, message } } }]
  @Field(() => GraphQLJSON)
  rows: RecordImportRowDTO[];
}

export type RecordImportRowDTO = {
  rowNumber: number;
  values: Record<string, string | boolean | undefined>;
  errors: Record<string, { level: string; message: string }>;
};
