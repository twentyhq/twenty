import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity'; // Using Workspace entity directly

@ObjectType('IssuerDto') // Renaming to IssuerDto to avoid conflict with Issuer entity if used in the same context by NestJS Query
export class IssuerDto {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  cnpj: string;

  @Field(() => String, { nullable: true })
  cpf?: string;

  @Field(() => String, { nullable: true })
  ie?: string;

  @Field(() => String, { nullable: true })
  cnaeCode?: string;

  @Field(() => String)
  cep: string;

  @Field(() => String)
  street: string;

  @Field(() => String)
  number: string;

  @Field(() => String)
  neighborhood: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  state: string;

  @Field(() => String)
  taxRegime: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Workspace)
  workspace: Workspace;
}
