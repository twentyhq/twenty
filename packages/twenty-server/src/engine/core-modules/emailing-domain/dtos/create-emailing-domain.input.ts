import { Field, InputType } from '@nestjs/graphql';

import { Matches, MaxLength } from 'class-validator';

// Domain labels (alphanumeric + hyphens, each up to 63 chars) separated by
// dots. Validated because the value flows into SES verify/register and the
// unsubscribe hostname (unsubscribe.<domain>), so malformed input must not
// reach those. The resolver lowercases/trims, since ResolverValidationPipe
// validates but does not return the class-transformer output.
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
