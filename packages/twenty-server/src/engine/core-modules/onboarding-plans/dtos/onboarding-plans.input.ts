import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOnboardingPlansInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  @IsNotEmpty()
  features: string[];

  @IsString()
  @IsOptional()
  stripe_product_id: string;

  @IsString()
  @IsOptional()
  stripe_price_id: string;
}
