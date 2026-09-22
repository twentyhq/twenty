import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';

registerEnumType(MessageTrackingConsentSource, {
  name: 'MessageTrackingConsentSource',
});

@ObjectType('MessageTrackingOptOut')
export class MessageTrackingOptOutDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => String)
  emailAddress: string;

  @Field(() => MessageTrackingConsentSource)
  source: MessageTrackingConsentSource;
}

@ObjectType('MessageTrackingOptOutList')
export class MessageTrackingOptOutListDTO {
  @Field(() => [MessageTrackingOptOutDTO])
  records: MessageTrackingOptOutDTO[];

  @Field(() => Int)
  totalCount: number;
}
