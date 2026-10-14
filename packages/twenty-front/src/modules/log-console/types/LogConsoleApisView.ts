import { type LogConsoleResourceView } from '@/log-console/types/LogConsoleResourceView';
import { type PlaygroundSchemas } from '@/settings/mcp-and-apis/types/PlaygroundSchemas';
import { type PlaygroundTypes } from '@/settings/mcp-and-apis/types/PlaygroundTypes';

export type LogConsoleApisView =
  | LogConsoleResourceView
  | {
      type: 'playground';
      playgroundType: PlaygroundTypes;
      schema: PlaygroundSchemas;
    };
