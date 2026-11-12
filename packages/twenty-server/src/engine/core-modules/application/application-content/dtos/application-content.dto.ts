import { Field, ObjectType } from '@nestjs/graphql';

import { ApplicationContentItemDTO } from 'src/engine/core-modules/application/application-content/dtos/application-content-item.dto';

@ObjectType('ApplicationContent')
export class ApplicationContentDTO {
  @Field(() => [ApplicationContentItemDTO])
  objects: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  fields: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  indexes: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  views: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  viewFields: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  pageLayouts: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  pageLayoutTabs: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  navigationMenuItems: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  commandMenuItems: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  frontComponents: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  workflows: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  logicFunctions: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  agents: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  skills: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  roles: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  permissionFlags: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  connectionProviders: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  publicAssets: ApplicationContentItemDTO[];

  @Field(() => [ApplicationContentItemDTO])
  translations: ApplicationContentItemDTO[];
}
