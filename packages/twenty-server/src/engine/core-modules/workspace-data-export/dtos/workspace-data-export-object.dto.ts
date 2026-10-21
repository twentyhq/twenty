import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkspaceDataExportObject')
export class WorkspaceDataExportObjectDTO {
  @Field(() => String)
  nameSingular: string;

  @Field(() => String)
  labelSingular: string;

  @Field(() => Int)
  columnCount: number;

  @Field(() => Int)
  rowCount: number;

  @Field(() => Boolean)
  isExported: boolean;
}
