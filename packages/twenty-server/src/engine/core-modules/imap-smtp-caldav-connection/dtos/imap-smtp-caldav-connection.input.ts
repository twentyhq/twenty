import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AccountType {
  @Field(() => String)
  type: 'IMAP' | 'SMTP' | 'CALDAV';
}

@InputType()
export class ConnectionParametersInput {
  @Field(() => String)
  host: string;

  @Field(() => Number)
  port: number;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => Boolean, { nullable: true })
  secure?: boolean;
}

@InputType('EmailAccountConnectionParameters')
export class EmailAccountConnectionParametersInput {
  @Field(() => ConnectionParametersInput, { nullable: true })
  IMAP?: ConnectionParametersInput;

  @Field(() => ConnectionParametersInput, { nullable: true })
  SMTP?: ConnectionParametersInput;

  @Field(() => ConnectionParametersInput, { nullable: true })
  CALDAV?: ConnectionParametersInput;
}
