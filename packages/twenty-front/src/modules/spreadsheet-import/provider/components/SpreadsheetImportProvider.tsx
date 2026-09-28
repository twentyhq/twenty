import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from 'twenty-ui/theme';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { SPREADSHEET_IMPORT_MODAL_ID } from '@/spreadsheet-import/constants/SpreadsheetImportModalId';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { matchColumnsState } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/states/initialComputedColumnsState';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const SpreadsheetImport = React.lazy(() =>
  import('./SpreadsheetImport').then((module) => ({
    default: module.SpreadsheetImport,
  })),
);

const LoadingSkeleton = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
    </SkeletonTheme>
  );
};

type SpreadsheetImportProviderProps = React.PropsWithChildren;

export const SpreadsheetImportProvider = (
  props: SpreadsheetImportProviderProps,
) => {
  const [spreadsheetImportDialog, setSpreadsheetImportDialog] = useAtomState(
    spreadsheetImportDialogState,
  );

  const setMatchColumns = useSetAtomState(matchColumnsState);

  const { closeDialog } = useDialog();

  const handleClose = () => {
    spreadsheetImportDialog.options?.onAbortSubmit?.();
    setSpreadsheetImportDialog({
      isOpen: false,
      isStepBarVisible: true,
      options: null,
    });

    closeDialog(SPREADSHEET_IMPORT_MODAL_ID);

    setMatchColumns([]);
  };

  return (
    <>
      {props.children}
      {spreadsheetImportDialog.isOpen && spreadsheetImportDialog.options && (
        <React.Suspense fallback={<LoadingSkeleton />}>
          <SpreadsheetImport
            onClose={handleClose}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...spreadsheetImportDialog.options}
          />
        </React.Suspense>
      )}
    </>
  );
};
