import { ToolCategory } from 'twenty-shared/ai';

import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export type SetuAiToolCallDecision =
  | { type: 'allow' }
  | { type: 'deny' }
  | { type: 'propose_send_email' }
  | { type: 'propose_record_update'; objectNameSingular: string };

// Read-only or self-contained action tools. Anything else in the action
// category can reach a mailbox, the network or code execution, so it is
// refused rather than trusted by name.
const ALLOWED_ACTION_TOOL_NAMES = new Set([
  'find_connected_accounts',
  'search_help_center',
  'navigate_app',
  'extract_json_paths',
  'search_output',
]);

// Presentation settings cannot send mail or change business records.
const ALLOWED_CATEGORIES = new Set<string>([
  ToolCategory.VIEW,
  ToolCategory.DASHBOARD,
  ToolCategory.NAVIGATION_MENU_ITEM,
]);

// Every tool reachable from an enabled sales chat is classified here; a tool
// this function does not recognise is unavailable. Metadata and descriptions
// supplied by an app or a model cannot mark a tool as safe.
export const classifySetuAiToolCall = (
  descriptor: ToolIndexEntry | ToolDescriptor,
): SetuAiToolCallDecision => {
  const { executionRef } = descriptor;

  switch (executionRef.kind) {
    case 'database_crud':
      switch (executionRef.operation) {
        case 'find_many':
        case 'find_one':
        case 'group_by':
        case 'create_one':
          return { type: 'allow' };
        case 'update_one':
          return {
            type: 'propose_record_update',
            objectNameSingular: executionRef.objectNameSingular,
          };
        default:
          return { type: 'deny' };
      }
    case 'static':
      if (descriptor.name === 'send_email') {
        return { type: 'propose_send_email' };
      }

      if (descriptor.category === ToolCategory.ACTION) {
        return ALLOWED_ACTION_TOOL_NAMES.has(descriptor.name)
          ? { type: 'allow' }
          : { type: 'deny' };
      }

      return ALLOWED_CATEGORIES.has(descriptor.category)
        ? { type: 'allow' }
        : { type: 'deny' };
    case 'logic_function':
      return { type: 'deny' };
    default:
      return { type: 'deny' };
  }
};
