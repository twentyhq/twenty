import {
  type FieldsConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

/**
 * Returns a temporary FieldsConfiguration with viewId: null.
 * When viewId is null, the FieldsWidget will use the fallback logic
 * to generate groups from the object metadata fields.
 */
export const useTemporaryFieldsConfiguration = (): FieldsConfiguration => {
  return {
    __typename: 'FieldsConfiguration',
    configurationType: WidgetConfigurationType.FIELDS,
    viewId: null,
  };
};
