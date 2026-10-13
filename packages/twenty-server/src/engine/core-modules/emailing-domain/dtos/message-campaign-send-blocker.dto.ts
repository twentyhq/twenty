import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { EmailingDomainExceptionCode } from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';

registerEnumType(EmailingDomainExceptionCode, {
  name: 'EmailingDomainExceptionCode',
});

@ObjectType()
export class MessageCampaignSendBlockerDTO {
  @Field(() => EmailingDomainExceptionCode)
  code: EmailingDomainExceptionCode;

  @Field(() => String)
  message: string;
}
