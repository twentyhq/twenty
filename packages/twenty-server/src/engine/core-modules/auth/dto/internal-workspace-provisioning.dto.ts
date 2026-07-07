import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class InternalWorkspaceProvisioningDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  primaryDomain?: string;

  @IsOptional()
  @IsEmail()
  serviceUserEmail?: string;
}

export class InternalWorkspaceApiKeyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
