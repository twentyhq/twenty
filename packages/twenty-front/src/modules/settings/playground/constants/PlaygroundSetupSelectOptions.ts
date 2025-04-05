import { PlaygroundTypes } from '@/settings/playground/types/PlaygroundTypes';
import { IconApi, IconBrandGraphql } from 'twenty-ui/display';

export const getPlaygroundSetupSelectOptions = (t: (key: TemplateStringsArray) => string) => [
    {
    value: PlaygroundTypes.REST,
    label: t`REST`,
    Icon: IconApi,
    },
    {
    value: PlaygroundTypes.GRAPHQL,
    label: t`GraphQL`,
    Icon: IconBrandGraphql,
    },
];
