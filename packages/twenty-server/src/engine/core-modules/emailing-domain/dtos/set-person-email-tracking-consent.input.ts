import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { IsEnum, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';

registerEnumType(MessageTrackingConsentDecision, {
  name: 'MessageTrackingConsentDecision',
});

@InputType()
export class SetPersonEmailTrackingConsentInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  personId: string;

  @Field(() => MessageTrackingConsentDecision)
  @IsEnum(MessageTrackingConsentDecision)
  decision: MessageTrackingConsentDecision;
}
