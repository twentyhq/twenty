import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type IframeConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isIframeConfiguration = (
  configuration: WidgetConfiguration | FieldsConfiguration | null | undefined,
): configuration is IframeConfiguration => {
  return configuration?.__typename === 'IframeConfiguration';
};
