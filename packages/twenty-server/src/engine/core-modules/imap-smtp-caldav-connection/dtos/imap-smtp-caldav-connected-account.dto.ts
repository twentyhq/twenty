import { Field, ObjectType } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ImapSmtpCaldavConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';

@ObjectType()
export class ConnectedImapSmtpCaldavAccount {
  @Field(() => String)
  id: string;

  @Field(() => String)
  handle: string;

  @Field(() => String)
  provider: ConnectedAccountProvider;

  @Field(() => String)
  accountOwnerId: string;

  @Field(() => ImapSmtpCaldavConnectionParameters, { nullable: true })
  connectionParameters: ImapSmtpCaldavConnectionParameters | null;
}
