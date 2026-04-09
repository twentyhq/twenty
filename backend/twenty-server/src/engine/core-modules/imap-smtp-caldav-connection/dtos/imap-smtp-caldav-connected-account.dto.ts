import { Field, ObjectType } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ImapSmtpCaldavConnectionParametersDTO } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';

@ObjectType('ConnectedImapSmtpCaldavAccount')
export class ConnectedImapSmtpCaldavAccountDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  handle: string;

  @Field(() => String)
  provider: ConnectedAccountProvider;

  @Field(() => UUIDScalarType)
  accountOwnerId: string;

  @Field(() => ImapSmtpCaldavConnectionParametersDTO, { nullable: true })
  connectionParameters: ImapSmtpCaldavConnectionParametersDTO | null;
}
