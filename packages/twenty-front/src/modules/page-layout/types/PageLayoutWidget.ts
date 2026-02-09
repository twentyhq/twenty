import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
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
  configuration: WidgetConfiguration | FieldsConfiguration | FieldConfiguration;
};
