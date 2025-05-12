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
}
