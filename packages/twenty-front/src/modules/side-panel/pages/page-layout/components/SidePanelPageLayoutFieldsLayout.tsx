import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { SidePanelSubPageNavigationHeader } from '@/side-panel/pages/common/components/SidePanelSubPageNavigationHeader';
import { usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { useTemporaryFieldsConfiguration } from '@/page-layout/hooks/useTemporaryFieldsConfiguration';
import { FieldsConfigurationEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationEditor';
import { FieldsWidgetGroupsDraftInitializationEffect } from '@/page-layout/widgets/fields/components/FieldsWidgetGroupsDraftInitializationEffect';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  type FieldsConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

export const SidePanelPageLayoutFieldsLayout = () => {
  const { goBackFromSidePanel } = useSidePanelHistory();

  const { pageLayoutId } =
    usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const temporaryFieldsConfiguration = useTemporaryFieldsConfiguration();

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const widgetConfiguration = widgetInEditMode.configuration;

  const fieldsConfiguration: FieldsConfiguration =
    isDefined(widgetConfiguration) &&
    widgetConfiguration.configurationType === WidgetConfigurationType.FIELDS
      ? (widgetConfiguration as FieldsConfiguration)
      : temporaryFieldsConfiguration;

  return (
    <StyledOuterContainer>
      <SidePanelSubPageNavigationHeader
        title={t`Layout`}
        onBackClick={goBackFromSidePanel}
      />
      <StyledContainer>
        <FieldsWidgetGroupsDraftInitializationEffect
          viewId={fieldsConfiguration.viewId ?? null}
          pageLayoutId={pageLayoutId}
          widgetId={widgetInEditMode.id}
        />
        <FieldsConfigurationEditor
          pageLayoutId={pageLayoutId}
          widgetId={widgetInEditMode.id}
        />
      </StyledContainer>
    </StyledOuterContainer>
  );
};
