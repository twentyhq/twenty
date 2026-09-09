import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// Carries ids only: the client resolves the Person through its ordinary
// record queries, so field permissions and deletions apply as everywhere else.
@ObjectType()
export class MessageCampaignEngagementRecipientDTO {
  @Field(() => UUIDScalarType)
  deliveryId: string;

  @Field(() => UUIDScalarType)
  personId: string;

  @Field(() => Date, { nullable: true })
  firstClickedAt: Date | null;

  @Field(() => Date)
  lastEngagedAt: Date;
}
