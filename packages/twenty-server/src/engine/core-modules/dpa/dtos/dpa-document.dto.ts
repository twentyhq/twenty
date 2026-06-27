import { Field, ObjectType } from '@nestjs/graphql';

import { DpaDocumentBlockDTO } from 'src/engine/core-modules/dpa/dtos/dpa-document-block.dto';
import { DpaRegion } from 'src/engine/core-modules/dpa/enums/dpa-region.enum';

@ObjectType('DpaDocument')
export class DpaDocumentDTO {
  @Field()
  title: string;

  @Field()
  lastUpdatedLabel: string;

  @Field()
  templateVersion: string;

  @Field(() => DpaRegion)
  region: DpaRegion;

  @Field()
  processorEntity: string;

  @Field()
  sccSectionActive: boolean;

  @Field({ nullable: true })
  notice?: string;

  @Field(() => [DpaDocumentBlockDTO])
  blocks: DpaDocumentBlockDTO[];
}
