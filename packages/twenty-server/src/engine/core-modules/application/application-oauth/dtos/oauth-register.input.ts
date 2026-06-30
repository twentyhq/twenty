import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// RFC 7591: OAuth 2.0 Dynamic Client Registration
export class OAuthRegisterInput {
  @IsString()
  @MaxLength(256)
  client_name: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  @MaxLength(2048, { each: true })
  redirect_uris: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  grant_types?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  response_types?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(50)
  token_endpoint_auth_method?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  scope?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  client_uri?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logo_uri?: string;
}
