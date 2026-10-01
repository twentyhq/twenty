import { type ToolCategory, type ToolWidgetName } from 'twenty-shared/ai';

import { type ToolExecutionRef } from 'src/engine/core-modules/tool-provider/types/tool-execution-ref.type';

export type ToolIndexEntry = {
  name: string;
  label: string;
  description: string;
  category: ToolCategory;
  executionRef: ToolExecutionRef;
  objectName?: string;
  operation?: string;
  icon?: string;
  widgetName?: ToolWidgetName;
  // App-supplied front component that renders this tool's calls instead of widgetName.
  frontComponentId?: string;
};
