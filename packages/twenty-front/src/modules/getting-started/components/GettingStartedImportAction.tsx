import { doNotTranslate } from 'twenty-shared/i18n';
import { useLingui } from '@lingui/react/macro';
import { IconUpload, IconExternalLink } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import {
  StyledGettingStartedColumn,
  StyledGettingStartedRow,
  StyledGettingStartedMuted,
} from '@/getting-started/components/GettingStartedStyles';

export const GettingStartedImportAction = () => {
  const { t } = useLingui();
  const { openObjectRecordsSpreadsheetImportDialog } =
    useOpenObjectRecordsSpreadsheetImportDialog('person');
  return (
    <StyledGettingStartedColumn>
      <StyledGettingStartedMuted>{t`Spreadsheet`}</StyledGettingStartedMuted>
      <Button
        size="sm"
        fullWidth
        startIcon={<IconUpload size={14} />}
        onClick={() => openObjectRecordsSpreadsheetImportDialog()}
      >{t`Upload file`}</Button>
      <StyledGettingStartedMuted>{t`A CSV or Excel import from any tool`}</StyledGettingStartedMuted>
      <StyledGettingStartedRow>
        <StyledGettingStartedMuted>{t`Export a CSV from`}</StyledGettingStartedMuted>
        <Button
          size="sm"
          variant="ghost"
          href="https://knowledge.hubspot.com/import-and-export/export-records"
          target="_blank"
          rel="noreferrer"
          endIcon={<IconExternalLink size={12} />}
        >
          {doNotTranslate('HubSpot')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          href="https://help.salesforce.com/s/articleView?id=platform.admin_exportdata.htm&type=5"
          target="_blank"
          rel="noreferrer"
          endIcon={<IconExternalLink size={12} />}
        >
          {doNotTranslate('Salesforce')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          href="https://support.pipedrive.com/en/article/exporting-data-from-pipedrive"
          target="_blank"
          rel="noreferrer"
          endIcon={<IconExternalLink size={12} />}
        >
          {doNotTranslate('Pipedrive')}
        </Button>
      </StyledGettingStartedRow>
    </StyledGettingStartedColumn>
  );
};
