import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

import { type IsExactly } from 'twenty-shared/types';
import { type z } from 'zod';

import { type StringPathOf } from 'src/engine/core-modules/application/types/application-target.type';
import { DEFINE_TOOL_METADATA_KEY } from 'src/engine/core-modules/tool-provider/constants/define-tool-metadata-key.constant';
import { type BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type DefineToolOptions } from 'src/engine/core-modules/tool-provider/types/define-tool-options.type';
import { type ToolApplicationTarget } from 'src/engine/core-modules/tool-provider/types/tool-application-target.type';

// Method parameters are bivariant, so BaseTool alone accepts an execute input narrower than the schema
type ExecuteInputMatchesInputSchema<TTool extends BaseTool> =
  Parameters<TTool['execute']> extends [{ input: infer TInput }, ...unknown[]]
    ? IsExactly<TInput, z.infer<TTool['inputSchema']>> extends true
      ? unknown
      : 'execute input must be exactly z.infer<typeof inputSchema>'
    : unknown;

type ApplicationTargetMatchesInputSchema<
  TTool extends BaseTool,
  TApplicationTarget extends ToolApplicationTarget | undefined,
> = TApplicationTarget extends { idKey: infer TIdKey }
  ? TIdKey extends StringPathOf<z.infer<TTool['inputSchema']>>
    ? unknown
    : 'applicationTarget.idKey must name a required string of the input schema'
  : unknown;

export const DefineTool =
  <
    const TApplicationTarget extends ToolApplicationTarget | undefined =
      undefined,
  >(
    options: DefineToolOptions & { applicationTarget?: TApplicationTarget },
  ) =>
  <TTool extends new (...args: never[]) => BaseTool>(
    target: TTool &
      ExecuteInputMatchesInputSchema<InstanceType<TTool>> &
      ApplicationTargetMatchesInputSchema<
        InstanceType<TTool>,
        TApplicationTarget
      >,
  ): void => {
    applyDecorators(
      Injectable(),
      SetMetadata(DEFINE_TOOL_METADATA_KEY, options),
    )(target);
  };
