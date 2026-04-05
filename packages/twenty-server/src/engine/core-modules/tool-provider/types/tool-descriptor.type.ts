import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export type ToolDescriptor = ToolIndexEntry & {
  inputSchema: object;
};
