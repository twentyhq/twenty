import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// a state stays valid for an hour, so a report replayed after the connection was archived or failed must not revive it
export const wasStateIssuedBeforeAccountChange = ({
  stateIssuedAtSeconds,
  connectedAccount,
}: {
  stateIssuedAtSeconds: number | undefined;
  connectedAccount: Pick<ConnectedAccountEntity, 'archivedAt' | 'authFailedAt'>;
}): boolean => {
  if (!isDefined(stateIssuedAtSeconds)) {
    return false;
  }

  // iat is truncated to the second, so only a change in a later second is known to come after it
  const firstMillisecondAfterIssuance = (stateIssuedAtSeconds + 1) * 1000;

  return [connectedAccount.archivedAt, connectedAccount.authFailedAt].some(
    (changedAt) =>
      isDefined(changedAt) &&
      new Date(changedAt).getTime() >= firstMillisecondAfterIssuance,
  );
};
