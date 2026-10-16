import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

import { DEFINE_TOOL_METADATA_KEY } from 'src/engine/core-modules/tool-provider/constants/define-tool-metadata-key.constant';
import { type BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool';
import { type DefineToolOptions } from 'src/engine/core-modules/tool-provider/types/define-tool-options.type';

export const DefineTool =
  (options: DefineToolOptions) =>
  <TTool extends new (...args: never[]) => BaseTool>(target: TTool): void => {
    applyDecorators(
      Injectable(),
      SetMetadata(DEFINE_TOOL_METADATA_KEY, options),
    )(target);
  };
