import { Field, ID, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateIssuerInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  cpf?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  ie?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  cnaeCode?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  cep: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  street: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  number: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  city: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  state: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  taxRegime: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;
}
