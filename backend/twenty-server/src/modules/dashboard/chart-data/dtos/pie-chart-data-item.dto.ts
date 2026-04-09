import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('PieChartDataItem')
export class PieChartDataItemDTO {
  @Field(() => String)
  id: string;

  @Field(() => Float)
  value: number;
}
