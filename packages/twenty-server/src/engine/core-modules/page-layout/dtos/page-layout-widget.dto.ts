import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';
import { IDField } from '@ptc-org/nestjs-query-graphql';

import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { GridPosition } from 'src/engine/core-modules/page-layout/types/grid-position.type';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

registerEnumType(WidgetType, { name: 'WidgetType' });

@ObjectType('GridPosition')
export class GridPositionDTO {
  @Field()
  row: number;

  @Field()
  column: number;

  @Field()
  rowSpan: number;

  @Field()
  columnSpan: number;
}

@ObjectType('PageLayoutWidget')
export class PageLayoutWidgetDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  pageLayoutTabId: string;

  @Field({ nullable: false })
  title: string;

  @Field(() => WidgetType, { nullable: false })
  type: WidgetType;

  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId: string | null;

  @Field(() => GridPositionDTO, { nullable: false })
  gridPosition: GridPosition;

  @Field(() => GraphQLJSON, { nullable: true })
  configuration: Record<string, unknown> | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
