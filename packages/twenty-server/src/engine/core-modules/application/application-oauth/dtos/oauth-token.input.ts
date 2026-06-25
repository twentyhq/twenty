import { IsOptional, IsString, MaxLength } from 'class-validator';

export class OAuthTokenInput {
  @IsString()
  @MaxLength(50)
  grant_type: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  redirect_uri?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  client_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  client_secret?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  code_verifier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  refresh_token?: string;
}
