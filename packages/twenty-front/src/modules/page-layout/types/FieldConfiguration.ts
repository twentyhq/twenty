import { type WidgetConfigurationType } from '~/generated/graphql';

export type FieldConfiguration = {
  __typename: 'FieldConfiguration';
  configurationType: WidgetConfigurationType.FIELD;
  fieldMetadataId: string;
  layout: 'FIELD' | 'CARD' | 'VIEW';
};
