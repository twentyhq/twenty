import { WidgetSettingsFooter } from '@/command-menu/pages/page-layout/components/WidgetSettingsFooter';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useRecordPageLayoutId } from '@/page-layout/hooks/useRecordPageLayoutId';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationEditor';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
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
  const targetRecord = useTargetRecord();
  const { pageLayoutId } = useRecordPageLayoutId(targetRecord);

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
