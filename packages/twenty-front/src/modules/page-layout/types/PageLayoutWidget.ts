import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type ConditionalDisplay, type Nullable } from 'twenty-shared/types';
import {
  type FieldsConfiguration,
  type PageLayoutWidget as PageLayoutWidgetGenerated,
  type WidgetConfiguration,
} from '~/generated-metadata/graphql';

export type PageLayoutWidget = Omit<
  PageLayoutWidgetGenerated,
  | 'objectMetadataId'
  | 'configuration'
  | 'conditionalAvailability'
  | 'conditionalDisplay'
> & {
  objectMetadataId?: Nullable<string>;
  configuration: WidgetConfiguration | FieldsConfiguration | FieldConfiguration;
  conditionalAvailability?: Nullable<ConditionalDisplay>;
  conditionalDisplay?: Nullable<ConditionalDisplay>;
};
