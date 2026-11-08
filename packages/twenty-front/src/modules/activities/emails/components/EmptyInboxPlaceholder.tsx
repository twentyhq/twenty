import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { LinkEmailThreadsDropdown } from '@/activities/emails/components/LinkEmailThreadsDropdown';
import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { useFirstConnectedAccount } from '@/activities/emails/hooks/useFirstConnectedAccount';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelector';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconLink, IconMail } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const EmptyInboxPlaceholder = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const navigateSettings = useNavigateSettings();
  const { openComposer, loading } =
    useComposeEmailForTargetRecord(targetRecord);

  const { connectedAccountId, loading: connectedAccountLoading } =
    useFirstConnectedAccount();
  const myConnectedAccounts = useAtomStateValue(myConnectedAccountsState);
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );
  const recordIdentifier = useAtomFamilySelectorValue(
    recordStoreIdentifierFamilySelector,
    { recordId: targetRecord.id, allowRequestsToTwentyIcons },
  );

  const recordName = recordIdentifier?.name;
  const hasAccountAbleToSend = isDefined(connectedAccountId);
  const hasConnectedAccount = isNonEmptyArray(myConnectedAccounts);

  return (
    <EmptyState.Root>
      <AnimatedPlaceholder type="emptyInbox" />
      <EmptyState.Content>
        <EmptyState.Title>
          <Trans>No messages yet</Trans>
        </EmptyState.Title>
        <EmptyState.Description>
          {hasAccountAbleToSend
            ? isNonEmptyString(recordName)
              ? t`Your conversations with ${recordName} will show up here.`
              : t`Your conversations will show up here.`
            : isNonEmptyString(recordName)
              ? t`Connect email, WhatsApp or LinkedIn to see your conversations with ${recordName} here.`
              : t`Connect email, WhatsApp or LinkedIn to see your conversations here.`}
        </EmptyState.Description>
      </EmptyState.Content>
      {!connectedAccountLoading && (
        <EmptyState.Actions>
          {hasConnectedAccount && (
            <LinkEmailThreadsDropdown
              dropdownIdPrefix="empty-inbox-link-email-threads"
              trigger={
                <Button startIcon={<IconLink />} variant="outline">
                  {t`Link email threads`}
                </Button>
              }
            />
          )}
          {hasAccountAbleToSend ? (
            <Button
              startIcon={<IconMail />}
              onClick={openComposer}
              disabled={loading}
              variant="outline"
            >{t`Send Email`}</Button>
          ) : (
            <Button
              onClick={() =>
                navigateSettings(
                  isAppPreferencesEnabled
                    ? SettingsPath.AppPreferences
                    : SettingsPath.NewAccount,
                )
              }
              variant="outline"
            >{t`Connect an account`}</Button>
          )}
        </EmptyState.Actions>
      )}
    </EmptyState.Root>
  );
};
