import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { Tool } from 'src/engine/core-modules/tool/types/tool.type';

export const TOOLS: Map<ToolType, Tool> = new Map([
  [ToolType.HTTP_REQUEST, new HttpTool()],
]);
