import { msg } from '@lingui/core/macro';
import { IconBox, IconHierarchy } from 'twenty-ui/icon';

import { PlaygroundSchemas } from '@/settings/mcp-and-apis/types/PlaygroundSchemas';

export const LOG_CONSOLE_API_DOCUMENTATION_SCHEMAS = [
  {
    value: PlaygroundSchemas.CORE,
    label: msg`Core`,
    Icon: IconBox,
  },
  {
    value: PlaygroundSchemas.METADATA,
    label: msg`Metadata`,
    Icon: IconHierarchy,
  },
];
