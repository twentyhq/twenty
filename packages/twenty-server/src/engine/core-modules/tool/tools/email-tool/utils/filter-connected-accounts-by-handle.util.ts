import { getSendableEmailHandles } from 'twenty-shared/utils';

const normalizeHandle = (handle: string): string => handle.trim().toLowerCase();

export const filterConnectedAccountsByHandle = <
  TConnectedAccount extends { handle: string; handleAliases: string[] | null },
>({
  connectedAccounts,
  handle,
}: {
  connectedAccounts: TConnectedAccount[];
  handle: string;
}): TConnectedAccount[] => {
  const normalizedHandle = normalizeHandle(handle);

  return connectedAccounts.filter((connectedAccount) =>
    getSendableEmailHandles(connectedAccount).some(
      (sendableHandle) => normalizeHandle(sendableHandle) === normalizedHandle,
    ),
  );
};
