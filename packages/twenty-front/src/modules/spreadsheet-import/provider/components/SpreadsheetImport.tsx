import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SpreadSheetImportModalWrapper } from '@/spreadsheet-import/components/SpreadSheetImportModalWrapper';
import { SPREADSHEET_IMPORT_MODAL_ID } from '@/spreadsheet-import/constants/SpreadsheetImportModalId';
import { SpreadsheetMaxRecordImportCapacity } from '@/spreadsheet-import/constants/SpreadsheetMaxRecordImportCapacity';
import { useSpreadsheetImportInitialStep } from '@/spreadsheet-import/hooks/useSpreadsheetImportInitialStep';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SpreadsheetImportStepperContainer } from '@/spreadsheet-import/steps/components/SpreadsheetImportStepperContainer';
import { SpreadsheetImportDialogOptions as SpreadsheetImportProps } from '@/spreadsheet-import/types';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useStepBar } from '@/ui/navigation/step-bar/hooks/useStepBar';
import { useLingui } from '@lingui/react/macro';

export const defaultSpreadsheetImportProps: Partial<
  SpreadsheetImportProps<any>
> = {
  autoMapHeaders: true,
  allowInvalidSubmit: true,
  autoMapDistance: 2,
  uploadStepHook: async (value) => value,
  selectHeaderStepHook: async (headerValues, data) => ({
    headerRow: headerValues,
    importedRows: data,
  }),
  matchColumnsStepHook: async (table) => table,
  dateFormat: 'yyyy-mm-dd', // ISO 8601,
  parseRaw: true,
  selectHeader: false,
  maxRecords: SpreadsheetMaxRecordImportCapacity,
} as const;

export const SpreadsheetImport = <T extends string>(
  props: SpreadsheetImportProps<T>,
) => {
  const mergedProps = {
    ...defaultSpreadsheetImportProps,
    ...props,
  } as SpreadsheetImportProps<T>;

  const { enqueueDialog } = useDialogManager();

  const { initialStepState } = useSpreadsheetImportInternal();

  const { initialStep } = useSpreadsheetImportInitialStep(
    initialStepState?.type,
  );

  const { activeStep } = useStepBar({
    initialStep,
  });

  const { t } = useLingui();

  const confirmOnClose = () => {
    if (activeStep < 1) {
      mergedProps.onClose();
      return;
    }

    enqueueDialog({
      title: t`Exit import flow`,
      message: t`Are you sure? Your current information will not be saved.`,
      buttons: [
        { title: t`Cancel` },
        {
          title: t`Exit`,
          onClick: mergedProps.onClose,
          accent: 'danger',
          role: 'confirm',
        },
      ],
    });
  };

  return (
    <ReactSpreadsheetImportContextProvider values={mergedProps}>
      <SpreadSheetImportModalWrapper
        modalId={SPREADSHEET_IMPORT_MODAL_ID}
        onClose={confirmOnClose}
      >
        <SpreadsheetImportStepperContainer />
      </SpreadSheetImportModalWrapper>
    </ReactSpreadsheetImportContextProvider>
  );
};
