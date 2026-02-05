import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { SidePanelSubPageNavigationHeader } from '@/command-menu/pages/common/components/SidePanelSubPageNavigationHeader';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useTemporaryFieldsConfiguration } from '@/page-layout/hooks/useTemporaryFieldsConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationEditor';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
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

export const CommandMenuPageLayoutFieldsLayout = () => {
  const { goBackFromCommandMenu } = useCommandMenuHistory();

  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const objectNameSingular = objectMetadataItem.nameSingular;

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
      <SidePanelSubPageNavigationHeader
        title={t`Layout`}
        onBackClick={goBackFromCommandMenu}
      />
      <StyledContainer>
        <FieldsConfigurationEditor
          configuration={fieldsConfiguration}
          onChange={handleConfigurationChange}
        />
      </StyledContainer>
    </StyledOuterContainer>
  );
};
