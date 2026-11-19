import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import {
  type ConditionalAvailabilityNode,
  type Nullable,
} from 'twenty-shared/types';
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
  | 'conditionalAvailabilityExpression'
  | 'conditionalDisplay'
> & {
  objectMetadataId?: Nullable<string>;
  configuration: WidgetConfiguration | FieldsConfiguration | FieldConfiguration;
  conditionalAvailability?: ConditionalAvailabilityNode | null;
};
