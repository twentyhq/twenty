import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { type RulesLogic } from 'json-logic-js';
import { type Nullable } from 'twenty-shared/types';
import {
  type PageLayoutWidget as PageLayoutWidgetGenerated,
  type WidgetConfiguration,
} from '~/generated/graphql';

export type PageLayoutWidget = Omit<
  PageLayoutWidgetGenerated,
  'objectMetadataId' | 'configuration'
> & {
  objectMetadataId?: Nullable<string>;
  conditionalDisplay?: RulesLogic;
  configuration: WidgetConfiguration | FieldsConfiguration | FieldConfiguration;
};
