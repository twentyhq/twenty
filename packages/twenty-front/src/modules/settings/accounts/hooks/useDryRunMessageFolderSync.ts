import { useLazyQuery } from '@apollo/client';

import { DRY_RUN_MESSAGE_FOLDER_SYNC } from '@/settings/accounts/graphql/queries/dryRunMessageFolderSync';

type DryRunImportResult = {
  totalMessagesInFolder: number;
  messagesToImport: number;
  alreadyImported: number;
  pendingImport: number;
  isEstimate: boolean;
};

type DryRunMessageFolderSyncQuery = {
  dryRunMessageFolderSync: DryRunImportResult;
};

type DryRunMessageFolderSyncQueryVariables = {
  messageFolderId: string;
};

export const useDryRunMessageFolderSync = () => {
  return useLazyQuery<
    DryRunMessageFolderSyncQuery,
    DryRunMessageFolderSyncQueryVariables
  >(DRY_RUN_MESSAGE_FOLDER_SYNC);
};
