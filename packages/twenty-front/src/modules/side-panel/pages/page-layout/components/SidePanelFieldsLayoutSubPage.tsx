import { useTemporaryFieldsConfiguration } from '@/page-layout/hooks/useTemporaryFieldsConfiguration';
import { FieldsConfigurationEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationEditor';
import { FieldsWidgetGroupsDraftInitializationEffect } from '@/page-layout/widgets/fields/components/FieldsWidgetGroupsDraftInitializationEffect';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type FieldsConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

const StyledFieldsLayoutContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

export const SidePanelFieldsLayoutSubPage = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const temporaryFieldsConfiguration = useTemporaryFieldsConfiguration();

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const widgetConfiguration = widgetInEditMode.configuration;

  const resolvedFieldsConfiguration: FieldsConfiguration =
    isDefined(widgetConfiguration) &&
    widgetConfiguration.configurationType === WidgetConfigurationType.FIELDS
      ? (widgetConfiguration as FieldsConfiguration)
      : temporaryFieldsConfiguration;

  return (
    <StyledFieldsLayoutContainer>
      <FieldsWidgetGroupsDraftInitializationEffect
        viewId={resolvedFieldsConfiguration.viewId ?? null}
        pageLayoutId={pageLayoutId}
        widgetId={widgetInEditMode.id}
      />
      <FieldsConfigurationEditor
        pageLayoutId={pageLayoutId}
        widgetId={widgetInEditMode.id}
      />
    </StyledFieldsLayoutContainer>
  );
};
