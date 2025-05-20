import { InputType, PartialType } from '@nestjs/graphql';

import { CreateIssuerInput } from './create-issuer.input';

@InputType()
export class UpdateIssuerInput extends PartialType(CreateIssuerInput) {}
