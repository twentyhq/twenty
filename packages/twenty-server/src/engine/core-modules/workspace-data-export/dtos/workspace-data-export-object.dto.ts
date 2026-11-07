import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkspaceDataExportObject')
export class WorkspaceDataExportObjectDTO {
  @Field(() => String)
  nameSingular: string;

  @Field(() => String)
  labelSingular: string;

  @Field(() => Int)
  fieldCount: number;

  @Field(() => Int)
  recordCount: number;

  @Field(() => Boolean)
  isExported: boolean;
}
