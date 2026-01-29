import { WidgetSettingsFooter } from '@/command-menu/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationEditor';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

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

export const CommandMenuPageLayoutFieldsSettings = () => {
  const { pageLayoutId } =
    usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const widgetConfiguration = widgetInEditMode.configuration;

  if (
    !widgetConfiguration ||
    !('configurationType' in widgetConfiguration) ||
    widgetConfiguration.configurationType !== 'FIELDS'
  ) {
    return null;
  }

  const fieldsConfiguration = widgetConfiguration as FieldsConfiguration;

  const handleConfigurationChange = (
    updatedConfiguration: FieldsConfiguration,
  ) => {
    updatePageLayoutWidget(widgetInEditMode.id, {
      configuration: updatedConfiguration,
    });
  };

  return (
    <StyledOuterContainer>
      <StyledContainer>
        <FieldsConfigurationEditor
          configuration={fieldsConfiguration}
          onChange={handleConfigurationChange}
        />
      </StyledContainer>
      <WidgetSettingsFooter />
    </StyledOuterContainer>
  );
};
