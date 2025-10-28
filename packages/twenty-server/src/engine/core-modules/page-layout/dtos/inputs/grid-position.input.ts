import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsNumber, Min } from 'class-validator';

import { GridPosition } from 'src/engine/core-modules/page-layout/types/grid-position.type';

@InputType('GridPositionInput')
export class GridPositionInput implements GridPosition {
  @Field()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  row: number;

  @Field()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  column: number;

  @Field()
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  rowSpan: number;

  @Field()
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  columnSpan: number;
}
