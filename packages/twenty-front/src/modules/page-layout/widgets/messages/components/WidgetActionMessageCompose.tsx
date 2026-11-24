import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { filterConnectedAccountsAbleToSendEmail } from '@/accounts/utils/filterConnectedAccountsAbleToSendEmail';
import { MessageChannelLogo } from '@/activities/emails/components/MessageChannelLogo';
import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { useConversationStartMessageChannels } from '@/activities/emails/hooks/useConversationStartMessageChannels';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenStartAppConversationInSidePanel } from '@/side-panel/hooks/useOpenStartAppConversationInSidePanel';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { MessageChannelType } from '~/generated/graphql';

export const WidgetActionMessageCompose = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const myConnectedAccounts = useAtomStateValue(myConnectedAccountsState);
  const { openComposer, openComposerWithConnectedAccount, loading } =
    useComposeEmailForTargetRecord(targetRecord);
  const { openStartAppConversationInSidePanel } =
    useOpenStartAppConversationInSidePanel();
  const hasSendPermission = useHasPermissionFlag(
    PermissionFlagType.SEND_EMAIL_TOOL,
  );

  const conversationStartChannels = useConversationStartMessageChannels({
    isSkipped:
      !hasSendPermission ||
      targetRecord.targetObjectNameSingular !==
        StandardObjectNameSingular.Person,
  });

  const senderAccounts = filterConnectedAccountsAbleToSendEmail(
    myConnectedAccounts ?? [],
  );

  const label = t`New message`;

  if (
    !isNonEmptyArray(senderAccounts) &&
    !isNonEmptyArray(conversationStartChannels)
  ) {
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
        {isNonEmptyArray(senderAccounts) && (
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
        )}
        {isNonEmptyArray(senderAccounts) &&
          isNonEmptyArray(conversationStartChannels) && <Dropdown.Separator />}
        {isNonEmptyArray(conversationStartChannels) && (
          <Dropdown.Section>
            {conversationStartChannels.map((conversationStartChannel) => (
              <Dropdown.ActionItem
                key={conversationStartChannel.messageChannelId}
                startIcon={
                  <MessageChannelLogo
                    channel={{
                      type: MessageChannelType.APP,
                      provider: conversationStartChannel.provider,
                      applicationId: conversationStartChannel.applicationId,
                    }}
                  />
                }
                onClick={() =>
                  openStartAppConversationInSidePanel({
                    messageChannelId: conversationStartChannel.messageChannelId,
                    channelLabel: conversationStartChannel.label,
                    personId: targetRecord.id,
                  })
                }
              >
                {conversationStartChannel.label}
              </Dropdown.ActionItem>
            ))}
          </Dropdown.Section>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
