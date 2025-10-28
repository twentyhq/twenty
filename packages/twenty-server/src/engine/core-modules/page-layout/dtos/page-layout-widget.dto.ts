import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  WidgetConfiguration,
  WidgetConfigurationInterface,
} from 'src/engine/core-modules/page-layout/dtos/widget-configuration.interface';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';

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
  gridPosition: GridPositionDTO;

  @Field(() => WidgetConfiguration, { nullable: true })
  configuration: WidgetConfigurationInterface | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
