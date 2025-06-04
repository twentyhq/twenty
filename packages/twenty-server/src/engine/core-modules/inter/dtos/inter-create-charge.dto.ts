import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';

import {
  InterCustomerType,
  InterCustomerUf,
} from 'src/engine/core-modules/inter/interfaces/charge.interface';

@InputType()
export class InterCreateChargeDto {
  @Field(() => String)
  @Length(11, 18)
  @IsNumberString()
  @IsNotEmpty()
  cpfCnpj: string;

  @Field(() => InterCustomerType)
  @IsEnum(InterCustomerType)
  @IsNotEmpty()
  legalEntity: InterCustomerType;

  @Field(() => String)
  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  address: string;

  @Field(() => String)
  @Length(1, 60)
  @IsString()
  @IsNotEmpty()
  city: string;

  @Field(() => InterCustomerUf)
  @IsEnum(InterCustomerUf)
  @IsNotEmpty()
  stateUnity: InterCustomerUf;

  @Field(() => String)
  @IsNumberString()
  @Length(8, 8)
  @IsString()
  @IsNotEmpty()
  cep: string;
}
