import { Field, ObjectType } from '@nestjs/graphql';

// A single resolved block of the DPA, sent to the frontend so it can render the
// document as React elements (no HTML injection). Mirrors ResolvedDpaBlock.
@ObjectType('DpaDocumentBlock')
export class DpaDocumentBlockDTO {
  @Field()
  kind: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  value?: string;
}

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
