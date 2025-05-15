import { IsOptional, IsString, IsInt, IsArray, IsUUID } from 'class-validator';

export class UpdateOnboardingPlansInput {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  stripe_product_id?: string;

  @IsOptional()
  @IsString()
  stripe_price_id?: string;
}
