import { useTheme } from '@emotion/react';
import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { SPREADSHEET_IMPORT_MODAL_ID } from '@/spreadsheet-import/constants/SpreadsheetImportModalId';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { matchColumnsState } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/states/initialComputedColumnsState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

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
  const [spreadsheetImportDialog, setSpreadsheetImportDialog] = useRecoilState(
    spreadsheetImportDialogState,
  );

  const setMatchColumnsState = useSetRecoilState(matchColumnsState);

  const { closeModal } = useModal();

  const handleClose = () => {
    spreadsheetImportDialog.options?.onAbortSubmit?.();
    setSpreadsheetImportDialog({
      isOpen: false,
      isStepBarVisible: true,
      options: null,
    });

    closeModal(SPREADSHEET_IMPORT_MODAL_ID);

    setMatchColumnsState([]);
  };

  return (
    <>
      {props.children}
      {spreadsheetImportDialog.isOpen && spreadsheetImportDialog.options && (
        <React.Suspense fallback={<LoadingSkeleton />}>
          <SpreadsheetImport
            onClose={handleClose}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...spreadsheetImportDialog.options}
          />
        </React.Suspense>
      )}
    </>
  );
};
