import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';

@InputType()
export class CreatePageLayoutInput {
  @Field({ nullable: false })
  name: string;

  @Field(() => PageLayoutType, {
    nullable: true,
    defaultValue: PageLayoutType.RECORD_PAGE,
  })
  type?: PageLayoutType;

  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId?: string;
}
