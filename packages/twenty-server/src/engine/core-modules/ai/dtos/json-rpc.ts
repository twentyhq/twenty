import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Validate,
} from 'class-validator';

import { IsNumberOrString } from 'src/engine/core-modules/ai/decorators/string-or-number';

export class JsonRpc {
  @IsString()
  @Matches(/^2\.0$/, { message: 'jsonrpc must be exactly "2.0"' })
  jsonrpc = '2.0';

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
  id: string | number | null;
}
