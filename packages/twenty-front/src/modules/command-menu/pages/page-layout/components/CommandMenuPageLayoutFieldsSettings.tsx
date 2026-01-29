import { WidgetSettingsFooter } from '@/command-menu/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useTemporaryFieldsConfiguration } from '@/page-layout/hooks/useTemporaryFieldsConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationEditor';
import styled from '@emotion/styled';
import { useState } from 'react';
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
  const { pageLayoutId, objectNameSingular } =
    usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const defaultFieldsConfiguration =
    useTemporaryFieldsConfiguration(objectNameSingular);
  const [fieldsConfiguration, setFieldsConfiguration] =
    useState<FieldsConfiguration>(defaultFieldsConfiguration);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const handleConfigurationChange = (
    updatedConfiguration: FieldsConfiguration,
  ) => {
    // TODO: replace with a call to updatePageLayoutWidget
    setFieldsConfiguration(updatedConfiguration);
  };

  return (
    <StyledOuterContainer>
      <StyledContainer>
        <FieldsConfigurationEditor
          configuration={fieldsConfiguration}
          onChange={handleConfigurationChange}
        />
      </StyledContainer>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledOuterContainer>
  );
};
