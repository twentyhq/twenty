import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

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

  const firstMillisecondAfterIssuance = (stateIssuedAtSeconds + 1) * 1000;

  return [connectedAccount.archivedAt, connectedAccount.authFailedAt].some(
    (changedAt) =>
      isDefined(changedAt) &&
      new Date(changedAt).getTime() >= firstMillisecondAfterIssuance,
  );
};
