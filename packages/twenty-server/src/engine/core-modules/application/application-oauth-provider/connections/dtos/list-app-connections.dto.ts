import { IsOptional, IsString } from 'class-validator';

export class ListAppConnectionsDto {
  @IsString()
  @IsOptional()
  providerName?: string;
}
