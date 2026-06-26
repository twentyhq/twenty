import { Field, ObjectType } from '@nestjs/graphql';

import { DpaDocumentBlockDTO } from 'src/engine/core-modules/dpa/dtos/dpa-document-block.dto';

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

  @Field()
  region: string;

  @Field()
  processorEntity: string;

  @Field()
  sccSectionActive: boolean;

  @Field(() => [DpaDocumentBlockDTO])
  blocks: DpaDocumentBlockDTO[];
}
