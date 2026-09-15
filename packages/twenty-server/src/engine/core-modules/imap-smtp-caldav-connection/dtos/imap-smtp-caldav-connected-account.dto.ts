import { Field, ObjectType } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ImapSmtpCaldavPublicConnectionParams')
class PublicConnectionParamsDTO {
  @Field(() => String)
  host: string;

  @Field(() => Number)
  port: number;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => EmailConnectionSecurity, { nullable: true })
  connectionSecurity?: EmailConnectionSecurity;
}

@ObjectType('ImapSmtpCaldavPublicConnectionParameters')
class ImapSmtpCaldavPublicConnectionParametersDTO {
  @Field(() => String, { nullable: true })
  name?: string | null;

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
