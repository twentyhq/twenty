import { PlaygroundTypes } from '@/settings/playground/types/PlaygroundTypes';
import { msg } from '@lingui/core/macro';
import { IconApi, IconBrandGraphql } from 'twenty-ui/display';

export const PLAYGROUND_SETUP_SELECT_OPTIONS = [
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
