import { IsUUID } from 'class-validator';

export class GetAppConnectionDto {
  @IsUUID()
  id: string;
}
