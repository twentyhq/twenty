import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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
