import { type AccountGroupAction } from '@/settings/app-preferences/types/AccountGroupAction';
import { Trans } from '@lingui/react/macro';

const getAccountGroupActionSentence = ({
  action,
  handle,
}: Pick<AccountGroupAction, 'action' | 'handle'>) => {
  if (action === 'disconnect') {
    return (
      <Trans>
        Disconnect {handle} from the following apps and connections? Their
        access and syncing will stop. Synced emails and events will be retained.
      </Trans>
    );
  }

  return (
    <Trans>
      This permanently deletes {handle}, the following connections, and all
      emails and events synced through them. This action cannot be undone.
    </Trans>
  );
};

type SettingsAccountGroupActionDialogSubtitleProps = {
  accountGroupAction: AccountGroupAction;
};

export const SettingsAccountGroupActionDialogSubtitle = ({
  accountGroupAction: { action, handle, targets },
}: SettingsAccountGroupActionDialogSubtitleProps) => (
  <>
    {getAccountGroupActionSentence({ action, handle })}
    <ul>
      {targets.map(({ id, label }) => (
        <li key={id}>{label}</li>
      ))}
    </ul>
  </>
);
