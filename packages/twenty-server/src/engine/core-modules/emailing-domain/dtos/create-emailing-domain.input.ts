import { Field, InputType } from '@nestjs/graphql';

import { Matches, MaxLength } from 'class-validator';

const DOMAIN_REGEX =
  /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;

@InputType()
export class CreateEmailingDomainInput {
  @Field(() => String)
  @MaxLength(255)
  @Matches(DOMAIN_REGEX, {
    message: 'domain must be a valid domain name (e.g. mail.example.com)',
  })
  domain: string;
}
