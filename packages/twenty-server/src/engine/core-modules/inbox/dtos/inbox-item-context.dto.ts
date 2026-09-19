import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum InboxItemContextSourceKind {
  EMAIL = 'EMAIL',
  THREAD = 'THREAD',
  RECORD = 'RECORD',
  CALL = 'CALL',
}

registerEnumType(InboxItemContextSourceKind, {
  name: 'InboxItemContextSourceKind',
});

@ObjectType('InboxItemContextSource')
export class InboxItemContextSourceDTO {
  @Field(() => InboxItemContextSourceKind)
  kind: InboxItemContextSourceKind;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  detail: string | null;

  @Field(() => String, { nullable: true })
  excerpt: string | null;

  @Field(() => Int, { nullable: true })
  messageCount: number | null;
}

// Where an item came from, and nothing else. Producers write the column with
// no schema behind them, so it is narrowed on the way out: a client gets a
// shape it can generate types from, and a producer that writes nonsense loses
// that field rather than the page.
@ObjectType('InboxItemContext')
export class InboxItemContextDTO {
  @Field(() => Int)
  version: number;

  @Field(() => String)
  producer: string;

  @Field(() => InboxItemContextSourceDTO, { nullable: true })
  source: InboxItemContextSourceDTO | null;
}

// One thing the item is about. The label is what the producer saw; where a
// record is named, the record is the better source and the surface follows it.
@ObjectType('InboxItemRecord')
export class InboxItemRecordDTO {
  @Field(() => String)
  id: string;

  @Field(() => Int)
  position: number;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  subtitle: string | null;

  // How this relates to the entry before it, which is the only edge the pane
  // ever draws.
  @Field(() => String, { nullable: true })
  relationLabel: string | null;

  @Field(() => String, { nullable: true })
  objectMetadataId: string | null;

  @Field(() => String, { nullable: true })
  recordId: string | null;
}
