import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class AccountType {
  @Field(() => String)
  type: 'IMAP' | 'SMTP' | 'CALDAV';
}

@InputType()
export class ConnectionParameters {
  @Field(() => String)
  host: string;

  @Field(() => Number)
  port: number;

  @Field(() => String, { nullable: true })
  username?: string;

  /**
   * Note: This field is stored in plain text in the database.
   * While encrypting it could provide an extra layer of defense, we have decided not to,
   * as database access implies a broader compromise. For context, see discussion in PR #12576.
   */
  @Field(() => String)
  password: string;

  @Field(() => Boolean, { nullable: true })
  secure?: boolean;
}

@InputType()
export class EmailAccountConnectionParameters {
  @Field(() => ConnectionParameters, { nullable: true })
  IMAP?: ConnectionParameters;

  @Field(() => ConnectionParameters, { nullable: true })
  SMTP?: ConnectionParameters;

  @Field(() => ConnectionParameters, { nullable: true })
  CALDAV?: ConnectionParameters;
}

@ObjectType('ConnectionParametersOutput')
export class ConnectionParametersOutputDTO {
  @Field(() => String)
  host: string;

  @Field(() => Number)
  port: number;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String)
  password: string;

  @Field(() => Boolean, { nullable: true })
  secure?: boolean;
}

@ObjectType('ImapSmtpCaldavConnectionParameters')
export class ImapSmtpCaldavConnectionParametersDTO {
  @Field(() => ConnectionParametersOutputDTO, { nullable: true })
  IMAP?: ConnectionParametersOutputDTO;

  @Field(() => ConnectionParametersOutputDTO, { nullable: true })
  SMTP?: ConnectionParametersOutputDTO;

  @Field(() => ConnectionParametersOutputDTO, { nullable: true })
  CALDAV?: ConnectionParametersOutputDTO;
}
