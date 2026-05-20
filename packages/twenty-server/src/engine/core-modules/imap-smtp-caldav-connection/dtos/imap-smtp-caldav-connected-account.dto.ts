import { Field, ObjectType } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ImapSmtpCaldavPublicConnectionParams')
class PublicConnectionParamsDTO {
  @Field(() => String)
  host: string;

  @Field(() => Number)
  port: number;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => Boolean, { nullable: true })
  secure?: boolean;
}

@ObjectType('ImapSmtpCaldavPublicConnectionParameters')
class ImapSmtpCaldavPublicConnectionParametersDTO {
  @Field(() => PublicConnectionParamsDTO, { nullable: true })
  IMAP?: PublicConnectionParamsDTO;

  @Field(() => PublicConnectionParamsDTO, { nullable: true })
  SMTP?: PublicConnectionParamsDTO;

  @Field(() => PublicConnectionParamsDTO, { nullable: true })
  CALDAV?: PublicConnectionParamsDTO;
}

@ObjectType('ConnectedImapSmtpCaldavAccount')
export class ConnectedImapSmtpCaldavAccountDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  handle: string;

  @Field(() => String)
  provider: ConnectedAccountProvider;

  @Field(() => UUIDScalarType)
  userWorkspaceId: string;

  @Field(() => ImapSmtpCaldavPublicConnectionParametersDTO, { nullable: true })
  connectionParameters: ImapSmtpCaldavPublicConnectionParametersDTO | null;
}
