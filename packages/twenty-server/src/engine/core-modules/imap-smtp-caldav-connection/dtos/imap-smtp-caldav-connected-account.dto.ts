import { Field, ObjectType, OmitType } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ConnectionParametersDTO } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';

@ObjectType('ImapSmtpCaldavPublicConnectionParams')
class PublicConnectionParamsDTO extends OmitType(ConnectionParametersDTO, [
  'password',
] as const) {}

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
