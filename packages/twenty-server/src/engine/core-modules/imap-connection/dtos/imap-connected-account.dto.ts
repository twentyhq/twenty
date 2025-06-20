import { Field, ObjectType } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ImapConnectionParams } from 'src/engine/core-modules/imap-connection/dtos/imap-connection.dto';

@ObjectType()
export class ConnectedImapAccount {
  @Field(() => String)
  id: string;

  @Field(() => String)
  handle: string;

  @Field(() => String)
  provider: ConnectedAccountProvider;

  @Field(() => String)
  accountOwnerId: string;

  @Field(() => ImapConnectionParams, { nullable: true })
  connectionParameters?: ImapConnectionParams;
}
