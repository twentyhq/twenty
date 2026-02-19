import {
  type FieldsConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export const useTemporaryFieldsConfiguration = (): FieldsConfiguration => {
  return {
    __typename: 'FieldsConfiguration',
    configurationType: WidgetConfigurationType.FIELDS,
    viewId: null,
  };
};
