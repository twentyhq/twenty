import { CalendarEventComposerFields } from '@/activities/calendar/components/CalendarEventComposerFields';
import { useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { composeCalendarEventInitialValuesComponentState } from '@/side-panel/pages/compose-calendar-event/states/composeCalendarEventInitialValuesComponentState';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconButton, useToast } from 'twenty-ui/components';
import { IconCalendarEvent, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const SidePanelComposeCalendarEventPage = () => {
  const composeCalendarEventInitialValues = useAtomComponentStateValue(
    composeCalendarEventInitialValuesComponentState,
  );
  const { goBackFromSidePanel } = useSidePanelHistory();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const navigateSettings = useNavigateSettings();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const hasConnectedAccountsPermission = useHasPermissionFlag(
    PermissionFlagType.CONNECTED_ACCOUNTS,
  );
  const { enqueueToast } = useToast();

  const composerState = useCalendarEventComposer({
    initialValues: composeCalendarEventInitialValues,
    onCreated: goBackFromSidePanel,
  });

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: composerState.handleCreate,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [composerState.handleCreate],
  });

  const handleAddAccount = () => {
    closeSidePanelMenu();
    navigateSettings(SettingsPath.NewAccount, undefined, undefined, {
      surface: 'main',
    });
  };

  const handleReauthorize = async () => {
    const selectedAccount = composerState.selectedAccount;

    if (
      !isDefined(selectedAccount) ||
      selectedAccount.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV
    ) {
      return;
    }

    try {
      await triggerApisOAuth(selectedAccount.provider, {
        redirectLocation: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        loginHint: selectedAccount.handle,
      });
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to reconnect calendar account`,
      });
    }
  };

  if (
    !isDefined(composeCalendarEventInitialValues) ||
    composerState.accountsLoading
  ) {
    return null;
  }

  return (
    <StyledContainer>
      <CalendarEventComposerFields
        composerState={composerState}
        contextRecord={composeCalendarEventInitialValues.contextRecord}
        onAddAccount={handleAddAccount}
        onReauthorize={
          hasConnectedAccountsPermission ? handleReauthorize : undefined
        }
      />
      <SidePanelFooter
        actions={[
          <IconButton
            key="discard"
            size="sm"
            variant="outline"
            aria-label={t`Discard`}
            onClick={goBackFromSidePanel}
          >
            <IconTrash />
          </IconButton>,
          <Button
            key="create"
            size="sm"
            startIcon={<IconCalendarEvent />}
            hotkeys={[getOsControlSymbol(), '⏎']}
            onClick={composerState.handleCreate}
            disabled={!composerState.canCreate}
            variant="solid"
            color="accent"
          >{t`Create event`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
