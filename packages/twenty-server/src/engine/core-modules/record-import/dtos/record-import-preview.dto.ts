import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { RecordImportDTO } from 'src/engine/core-modules/record-import/dtos/record-import.dto';

@ObjectType('RecordImportPreview')
export class RecordImportPreviewDTO {
  @Field(() => RecordImportDTO)
  recordImport: RecordImportDTO;

  // Cells of the first rows of the sheet, as an array of string arrays
  @Field(() => GraphQLJSON)
  rows: string[][];
}
