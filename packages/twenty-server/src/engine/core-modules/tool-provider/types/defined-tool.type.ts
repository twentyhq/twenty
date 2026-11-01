import { type BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type DefineToolOptions } from 'src/engine/core-modules/tool-provider/types/define-tool-options.type';

export type DefinedTool = {
  options: DefineToolOptions;
  tool: BaseTool;
  inputJsonSchema: object;
};
