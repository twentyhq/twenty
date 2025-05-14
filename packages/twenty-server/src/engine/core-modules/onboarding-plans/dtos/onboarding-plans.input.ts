import { IsString, IsInt, IsArray } from 'class-validator';

export class CreateOnboardingPlansInput {
  @IsString()
  title: string;

  @IsInt()
  price: number;

  @IsString()
  type: string;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsString()
  stripe_product_id: string;

  @IsString()
  stripe_price_id: string;
}
