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

export enum InboxItemContextEntityKind {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
  OPPORTUNITY = 'OPPORTUNITY',
  OTHER = 'OTHER',
}

registerEnumType(InboxItemContextEntityKind, {
  name: 'InboxItemContextEntityKind',
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

@ObjectType('InboxItemContextEntity')
export class InboxItemContextEntityDTO {
  // The producer's own handle for this entity, which the edges refer to. Not a
  // record id: an entity can be someone the workspace has no record for.
  @Field(() => String)
  key: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  subtitle: string | null;

  @Field(() => InboxItemContextEntityKind)
  kind: InboxItemContextEntityKind;

  @Field(() => String, { nullable: true })
  recordId: string | null;

  @Field(() => String, { nullable: true })
  objectMetadataId: string | null;
}

@ObjectType('InboxItemContextEdge')
export class InboxItemContextEdgeDTO {
  @Field(() => String)
  from: string;

  @Field(() => String)
  to: string;

  @Field(() => String)
  label: string;
}

// The context travels as jsonb written by producers the API does not control,
// so it is narrowed on the way out rather than handed over as raw JSON: a
// client gets a shape it can generate types from, and a producer that writes
// nonsense loses that field instead of the page.
@ObjectType('InboxItemContext')
export class InboxItemContextDTO {
  @Field(() => String, { nullable: true })
  summary: string | null;

  @Field(() => InboxItemContextSourceDTO, { nullable: true })
  source: InboxItemContextSourceDTO | null;

  @Field(() => [InboxItemContextEntityDTO])
  entities: InboxItemContextEntityDTO[];

  @Field(() => [InboxItemContextEdgeDTO])
  edges: InboxItemContextEdgeDTO[];
}
