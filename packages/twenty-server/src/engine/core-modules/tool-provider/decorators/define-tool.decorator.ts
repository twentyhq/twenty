import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

import { type IsExactly } from 'twenty-shared/types';
import { type z } from 'zod';

import { DEFINE_TOOL_METADATA_KEY } from 'src/engine/core-modules/tool-provider/constants/define-tool-metadata-key.constant';
import { type BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type DefineToolOptions } from 'src/engine/core-modules/tool-provider/types/define-tool-options.type';

// Method parameters are bivariant, so BaseTool alone accepts an execute input narrower than the schema
type ExecuteInputMatchesInputSchema<TTool extends BaseTool> =
  Parameters<TTool['execute']> extends [{ input: infer TInput }, ...unknown[]]
    ? IsExactly<TInput, z.infer<TTool['inputSchema']>> extends true
      ? unknown
      : 'execute input must be exactly z.infer<typeof inputSchema>'
    : unknown;

export const DefineTool =
  (options: DefineToolOptions) =>
  <TTool extends new (...args: never[]) => BaseTool>(
    target: TTool & ExecuteInputMatchesInputSchema<InstanceType<TTool>>,
  ): void => {
    applyDecorators(
      Injectable(),
      SetMetadata(DEFINE_TOOL_METADATA_KEY, options),
    )(target);
  };
