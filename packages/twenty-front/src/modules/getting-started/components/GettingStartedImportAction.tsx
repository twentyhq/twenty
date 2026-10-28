import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { GETTING_STARTED_IMPORT_CONTEXT_STORE_INSTANCE_ID } from '@/getting-started/constants/GettingStartedImportContextStoreInstanceId';
import { SPREADSHEET_EXPORT_GUIDES } from '@/getting-started/constants/SpreadsheetExportGuides';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { IconExternalLink, IconUpload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { GettingStartedStep } from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

export const GettingStartedImportAction = () => {
  const { t } = useLingui();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Person,
  });
  const setContextStoreCurrentObjectMetadataItemId = useSetAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    GETTING_STARTED_IMPORT_CONTEXT_STORE_INSTANCE_ID,
  );
  const { openObjectRecordsSpreadsheetImportDialog } =
    useOpenObjectRecordsSpreadsheetImportDialog(CoreObjectNameSingular.Person);

  const openImportDialog = () => {
    setContextStoreCurrentObjectMetadataItemId(objectMetadataItem.id);
    openObjectRecordsSpreadsheetImportDialog({
      uploadStepHook: async (importedRows) => {
        void updateGettingStarted({
          completedStep: GettingStartedStep.IMPORT_DATA,
        });

        return importedRows;
      },
    });
  };

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: GETTING_STARTED_IMPORT_CONTEXT_STORE_INSTANCE_ID }}
    >
      <SpreadsheetImportProvider>
        <StyledColumn>
          <Text size="sm" color="tertiary">{t`Spreadsheet`}</Text>
          <Button
            size="sm"
            fullWidth
            startIcon={<IconUpload />}
            onClick={openImportDialog}
          >{t`Upload file`}</Button>
          <Text
            size="sm"
            color="tertiary"
          >{t`A CSV or Excel import from any tool`}</Text>
          <StyledRow>
            <Text size="sm" color="tertiary">{t`Export a CSV from`}</Text>
            {SPREADSHEET_EXPORT_GUIDES.map((guide) => (
              <Button
                key={guide.name}
                size="sm"
                variant="outline"
                href={guide.url}
                target="_blank"
                rel="noreferrer"
                endIcon={<IconExternalLink />}
              >
                {guide.name}
              </Button>
            ))}
          </StyledRow>
        </StyledColumn>
      </SpreadsheetImportProvider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
