import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { isDefined } from 'twenty-shared/utils';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

// The table display mode renders an embedded view, so it only means anything
// once the widget has one. A widget stranded in that mode without a view — its
// view deleted, or a layout picked before one could be created — renders its
// inline relation instead of an empty card.
export const getFieldWidgetEffectiveDisplayMode = (
  configuration: FieldConfiguration,
): FieldDisplayMode =>
  configuration.fieldDisplayMode === FieldDisplayMode.TABLE &&
  !isDefined(getWidgetConfigurationViewId(configuration))
    ? FieldDisplayMode.FIELD
    : configuration.fieldDisplayMode;
