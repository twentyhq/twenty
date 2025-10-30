import { Field, InputType } from '@nestjs/graphql';

import { IsInt, IsNotEmpty, Min } from 'class-validator';

import { GridPosition } from 'src/engine/core-modules/page-layout/types/grid-position.type';

@InputType('GridPositionInput')
export class GridPositionInput implements GridPosition {
  @Field()
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  row: number;

  @Field()
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  column: number;

  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  rowSpan: number;

  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  columnSpan: number;
}
