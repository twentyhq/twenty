import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

export const getFieldWidgetDisplayModeConfigurationUpdate = (
  fieldDisplayMode: FieldDisplayMode,
): Pick<FieldConfiguration, 'fieldDisplayMode'> &
  Partial<Pick<FieldConfiguration, 'viewerControls'>> => ({
  fieldDisplayMode,
  ...(fieldDisplayMode === FieldDisplayMode.TABLE
    ? {}
    : { viewerControls: undefined }),
});
