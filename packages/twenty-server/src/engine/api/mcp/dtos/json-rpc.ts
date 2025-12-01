import {
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Validate,
} from 'class-validator';

import { IsNumberOrString } from 'src/engine/api/mcp/decorators/string-or-number';

export class JsonRpc {
  @IsString()
  @Matches(/^2\.0$/, { message: 'jsonrpc must be exactly "2.0"' })
  jsonrpc = '2.0';

  @IsDefined({ message: 'method is required' })
  @IsString()
  @IsNotEmpty()
  method: string;

  @IsOptional()
  @IsObject()
  params?: {
    name: string;
    arguments: unknown;
  };

  @IsOptional()
  @Validate(IsNumberOrString)
  id: string | number;
}
