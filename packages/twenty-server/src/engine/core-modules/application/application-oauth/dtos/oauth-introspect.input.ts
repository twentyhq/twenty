import { IsOptional, IsString, MaxLength } from 'class-validator';

export class OAuthIntrospectInput {
  @IsString()
  @MaxLength(4096)
  token: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  token_type_hint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  client_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  client_secret?: string;
}
