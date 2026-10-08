import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { isDefined } from 'twenty-shared/utils';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

// Table mode without a view (deleted, or not yet created) falls back to the inline relation.
export const getFieldWidgetEffectiveDisplayMode = (
  configuration: FieldConfiguration,
): FieldDisplayMode =>
  configuration.fieldDisplayMode === FieldDisplayMode.TABLE &&
  !isDefined(getWidgetConfigurationViewId(configuration))
    ? FieldDisplayMode.FIELD
    : configuration.fieldDisplayMode;
