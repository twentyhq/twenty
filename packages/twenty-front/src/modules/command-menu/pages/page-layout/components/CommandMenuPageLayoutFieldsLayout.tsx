import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { SidePanelSubPageNavigationHeader } from '@/command-menu/pages/common/components/SidePanelSubPageNavigationHeader';
import { usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useTemporaryFieldsConfiguration } from '@/page-layout/hooks/useTemporaryFieldsConfiguration';
import { FieldsConfigurationEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationEditor';
import { FieldsWidgetGroupsDraftInitializationEffect } from '@/page-layout/widgets/fields/components/FieldsWidgetGroupsDraftInitializationEffect';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  type FieldsConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

const StyledOuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)};
  overflow-y: auto;
`;

export const CommandMenuPageLayoutFieldsLayout = () => {
  const { goBackFromCommandMenu } = useCommandMenuHistory();

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
        onBackClick={goBackFromCommandMenu}
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
