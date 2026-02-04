import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type PageLayoutWidget as PageLayoutWidgetGenerated,
  type WidgetConfiguration,
} from '~/generated/graphql';

export type PageLayoutWidget = Omit<
  PageLayoutWidgetGenerated,
  'configuration'
> & {
  configuration: WidgetConfiguration | FieldsConfiguration | FieldConfiguration;
};
