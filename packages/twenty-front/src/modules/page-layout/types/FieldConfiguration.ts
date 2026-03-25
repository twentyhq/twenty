import {
  type FieldDisplayMode,
  type WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export type FieldConfiguration = {
  __typename: 'FieldConfiguration';
  configurationType: WidgetConfigurationType.FIELD;
  fieldMetadataId: string;
  fieldDisplayMode: FieldDisplayMode;
};
