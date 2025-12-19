import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type IframeConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isIframeConfiguration = (
  configuration:
    | WidgetConfiguration
    | FieldConfiguration
    | FieldsConfiguration
    | null
    | undefined,
): configuration is IframeConfiguration => {
  return configuration?.__typename === 'IframeConfiguration';
};
