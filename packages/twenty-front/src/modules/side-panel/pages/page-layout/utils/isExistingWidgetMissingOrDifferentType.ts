import { type WidgetType } from '~/generated-metadata/graphql';

export const isExistingWidgetMissingOrDifferentType = (
  existingWidgetType: WidgetType | undefined,
  targetType: WidgetType,
): boolean => {
  return existingWidgetType === undefined || existingWidgetType !== targetType;
};
