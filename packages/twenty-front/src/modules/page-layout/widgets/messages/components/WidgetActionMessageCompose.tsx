import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { filterConnectedAccountsAbleToSendEmail } from '@/accounts/utils/filterConnectedAccountsAbleToSendEmail';
import { MessageChannelLogo } from '@/activities/emails/components/MessageChannelLogo';
import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { MessageChannelType } from '~/generated/graphql';

export const WidgetActionMessageCompose = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const myConnectedAccounts = useAtomStateValue(myConnectedAccountsState);
  const { openComposer, openComposerWithConnectedAccount, loading } =
    useComposeEmailForTargetRecord(targetRecord);

  const senderAccounts = filterConnectedAccountsAbleToSendEmail(
    myConnectedAccounts ?? [],
  );

  const label = t`New message`;

  if (!isNonEmptyArray(senderAccounts)) {
    return (
      <WidgetCardHeaderActionButton
        Icon={IconPlus}
        label={label}
        onClick={openComposer}
        disabled={loading}
      />
    );
  }

  return (
    <DropdownRoot
      dropdownId={`widget-action-message-compose-${targetRecord.id}`}
      type="menu"
    >
      <Dropdown.Trigger
        render={
          <WidgetCardHeaderActionButton
            Icon={IconPlus}
            label={label}
            disabled={loading}
          />
        }
      />
      <DropdownContent
        width={GenericDropdownContentWidth.Large}
        align="end"
        aria-label={t`Send from`}
      >
        <Dropdown.Section>
          {senderAccounts.map((connectedAccount) => (
            <Dropdown.ActionItem
              key={connectedAccount.id}
              startIcon={
                <MessageChannelLogo
                  channel={{
                    type: MessageChannelType.EMAIL,
                    provider: connectedAccount.provider,
                    applicationId: connectedAccount.applicationId,
                  }}
                />
              }
              onClick={() =>
                openComposerWithConnectedAccount(connectedAccount.id)
              }
            >
              {connectedAccount.handle}
            </Dropdown.ActionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
