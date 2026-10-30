import { InputType, OmitType } from '@nestjs/graphql';

import { InboxThreadRecordInputDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/inbox-thread-record.input';

@InputType('InboxMessageRecordTargetInput')
export class InboxMessageRecordTargetInputDTO extends OmitType(
  InboxThreadRecordInputDTO,
  ['threadId'] as const,
  InputType,
) {}
