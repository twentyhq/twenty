import { msg } from '@lingui/core/macro';
import { IconApi, IconBrandGraphql } from 'twenty-ui/icon';

import { PlaygroundTypes } from '@/settings/mcp-and-apis/types/PlaygroundTypes';

export const LOG_CONSOLE_API_DOCUMENTATION_TYPES = [
  {
    value: PlaygroundTypes.REST,
    label: msg`REST`,
    Icon: IconApi,
  },
  {
    value: PlaygroundTypes.GRAPHQL,
    label: msg`GraphQL`,
    Icon: IconBrandGraphql,
  },
];
