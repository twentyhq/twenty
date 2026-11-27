import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type ConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import { type Nullable } from 'twenty-shared/types';
import {
  type FieldsConfiguration,
  type PageLayoutWidget as PageLayoutWidgetGenerated,
  type WidgetConfiguration,
} from '~/generated-metadata/graphql';

export type PageLayoutWidget = Omit<
  PageLayoutWidgetGenerated,
  'objectMetadataId' | 'configuration' | 'conditionalAvailability'
> & {
  objectMetadataId?: Nullable<string>;
  configuration: WidgetConfiguration | FieldsConfiguration | FieldConfiguration;
  conditionalAvailabilityExpression?: Nullable<string>;
  conditionalAvailability?: ConditionalEvaluationNode | null;
};
