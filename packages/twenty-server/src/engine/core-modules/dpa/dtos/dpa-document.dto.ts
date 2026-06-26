import { Field, ObjectType } from '@nestjs/graphql';

import { DpaDocumentBlockDTO } from 'src/engine/core-modules/dpa/dtos/dpa-document-block.dto';
import { DpaRegion } from 'src/engine/core-modules/dpa/enums/dpa-region.enum';

// The resolved DPA document for preview, including the metadata the UI surfaces
// (template version, region, contracting entity, SCC state).
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

  // Present when the document is not a valid agreement (self-hosted deployment).
  @Field({ nullable: true })
  notice?: string;

  @Field(() => [DpaDocumentBlockDTO])
  blocks: DpaDocumentBlockDTO[];
}
