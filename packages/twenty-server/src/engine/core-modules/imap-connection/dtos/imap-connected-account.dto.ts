import { Field, ObjectType } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { IMAP_SMTP_CALDEVConnectionParameters } from 'src/engine/core-modules/imap-connection/dtos/imap-connection.dto';

@ObjectType()
export class ConnectedIMAP_SMTP_CALDEVAccount {
  @Field(() => String)
  id: string;

  @Field(() => String)
  handle: string;

  @Field(() => String)
  provider: ConnectedAccountProvider;

  @Field(() => String)
  accountOwnerId: string;

  @Field(() => IMAP_SMTP_CALDEVConnectionParameters, { nullable: true })
  connectionParameters: IMAP_SMTP_CALDEVConnectionParameters | null;
}
