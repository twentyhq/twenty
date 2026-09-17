import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useState } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { GET_DATABASE_CONFIG_VARIABLE } from '@/settings/admin-panel/config-variables/graphql/queries/getDatabaseConfigVariable';
import { useConfigVariableActions } from '@/settings/admin-panel/config-variables/hooks/useConfigVariableActions';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { SubscriptionInfoRowContainer } from '@/settings/billing/components/internal/SubscriptionInfoRowContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import {
  ENTERPRISE_PLAN_MODAL_ID,
  EnterprisePlanModal,
} from '@/settings/enterprise/components/EnterprisePlanModal';
import { REFRESH_ENTERPRISE_VALIDITY_TOKEN } from '@/settings/enterprise/graphql/mutations/refreshEnterpriseValidityToken';
import { RELEASE_ENTERPRISE_SERVER_BINDING } from '@/settings/enterprise/graphql/mutations/releaseEnterpriseServerBinding';
import { SET_ENTERPRISE_KEY } from '@/settings/enterprise/graphql/mutations/setOrganizationKey';
import { ENTERPRISE_PORTAL_SESSION } from '@/settings/enterprise/graphql/queries/enterprisePortalSession';
import { ENTERPRISE_SUBSCRIPTION_STATUS } from '@/settings/enterprise/graphql/queries/enterpriseSubscriptionStatus';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import {
  ENTERPRISE_INSTANCE_TYPE,
  type EnterpriseInstanceType,
} from 'twenty-shared/constants';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { useToast } from 'twenty-ui/primitives/feedback';
import {
  IconCalendarRepeat,
  IconCheck,
  IconCircleX,
  IconCreditCard,
  IconKey,
  IconUser,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const RELEASE_ENTERPRISE_BINDING_CONFIRMATION_MODAL_ID =
  'release-enterprise-binding-confirmation-modal';

type SettingsEnterpriseProps = {
  isAdminPanelTab?: boolean;
};

type SubscriptionStatus = {
  status: string | null;
  licensee: string | null;
  expiresAt: string | null;
  cancelAt: string | null;
  currentPeriodEnd: string | null;
  isCancellationScheduled: boolean;
};

type StatusDotVariant = 'active' | 'warning' | 'inactive';

const STATUS_DOT_COLOR: Record<StatusDotVariant, string> = {
  active: themeCssVariables.color.green,
  warning: themeCssVariables.color.orange,
  inactive: themeCssVariables.color.red,
};

const StyledStatusDot = styled.div<{ variant: StatusDotVariant }>`
  background-color: ${({ variant }) => STATUS_DOT_COLOR[variant]};
  border-radius: 50%;
  corner-shape: round;
  height: 8px;
  width: 8px;
`;

const StyledStatusContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCancellationNotice = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledInputContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledInputWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledActivateButtonWrapper = styled.div`
  flex-shrink: 0;
`;

const StyledSpacer = styled.div`
  height: ${themeCssVariables.spacing[4]};
`;

export const SettingsEnterprise = ({
  isAdminPanelTab = false,
}: SettingsEnterpriseProps = {}) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [enterpriseKey, setEnterpriseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [setEnterpriseKeyMutation] = useMutation<{
    setEnterpriseKey: {
      isValid: boolean;
      licensee: string | null;
      expiresAt: string | null;
      subscriptionId: string | null;
    };
  }>(SET_ENTERPRISE_KEY);
  const [refreshValidityTokenMutation] = useMutation<{
    refreshEnterpriseValidityToken: boolean;
  }>(REFRESH_ENTERPRISE_VALIDITY_TOKEN);
  const [releaseServerBindingMutation] = useMutation<{
    releaseEnterpriseServerBinding: {
      isValid: boolean;
      licensee: string | null;
      expiresAt: string | null;
      subscriptionId: string | null;
    };
  }>(RELEASE_ENTERPRISE_SERVER_BINDING);
  const [fetchPortalSession] = useLazyQuery<{
    enterprisePortalSession: string | null;
  }>(ENTERPRISE_PORTAL_SESSION);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isBoundToAnotherServer, setIsBoundToAnotherServer] = useState(false);
  const { openDialog } = useDialog();
  const { enqueueToast } = useToast();
  const { loadCurrentUser } = useLoadCurrentUser();

  const apolloAdminClient = useApolloAdminClient();
  const {
    handleUpdateVariable: updateInstanceTypeVariable,
    handleDeleteVariable: deleteInstanceTypeVariable,
  } = useConfigVariableActions('ENTERPRISE_INSTANCE_TYPE');
  const [instanceType, setInstanceType] = useState<EnterpriseInstanceType>(
    ENTERPRISE_INSTANCE_TYPE.PRODUCTION,
  );
  const [isInstanceTypeFromDb, setIsInstanceTypeFromDb] = useState(false);
  const [isUpdatingInstanceType, setIsUpdatingInstanceType] = useState(false);

  useEffect(() => {
    const loadInstanceType = async () => {
      try {
        const { data } = await apolloAdminClient.query<{
          getDatabaseConfigVariable: {
            value: unknown;
            source: string;
          } | null;
        }>({
          query: GET_DATABASE_CONFIG_VARIABLE,
          variables: { key: 'ENTERPRISE_INSTANCE_TYPE' },
          fetchPolicy: 'network-only',
        });

        const variable = data?.getDatabaseConfigVariable;

        setInstanceType(
          variable?.value === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
            ? ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
            : ENTERPRISE_INSTANCE_TYPE.PRODUCTION,
        );
        setIsInstanceTypeFromDb(variable?.source === 'DATABASE');
      } catch {
        // Best-effort: the instance-type control simply stays at its default.
      }
    };

    loadInstanceType();
  }, [apolloAdminClient]);

  const hasSignedEnterpriseKey =
    currentWorkspace?.hasValidSignedEnterpriseKey === true;
  const hasValidityToken =
    currentWorkspace?.hasValidEnterpriseValidityToken === true;

  const hasOrphanedValidityToken = hasValidityToken && !hasSignedEnterpriseKey;

  const [fetchSubscriptionStatus] = useLazyQuery<{
    enterpriseSubscriptionStatus: SubscriptionStatus | null;
  }>(ENTERPRISE_SUBSCRIPTION_STATUS, { fetchPolicy: 'network-only' });

  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [isStatusLoaded, setIsStatusLoaded] = useState(false);

  useEffect(() => {
    if (!hasSignedEnterpriseKey) {
      setIsStatusLoaded(true);

      return;
    }

    const loadStatus = async () => {
      const { data } = await fetchSubscriptionStatus();

      setSubscriptionStatus(data?.enterpriseSubscriptionStatus ?? null);
      setIsStatusLoaded(true);
    };

    loadStatus();
  }, [hasSignedEnterpriseKey, fetchSubscriptionStatus]);

  const stripeStatus = subscriptionStatus?.status ?? null;

  const isSubscriptionActiveOrTrialing =
    stripeStatus === 'active' || stripeStatus === 'trialing';
  const isCancelScheduled =
    subscriptionStatus?.isCancellationScheduled === true;
  const isCanceled = stripeStatus === 'canceled';
  const isPastDue = stripeStatus === 'past_due' || stripeStatus === 'unpaid';
  const isIncomplete =
    stripeStatus === 'incomplete' || stripeStatus === 'incomplete_expired';

  const licensee = subscriptionStatus?.licensee ?? null;

  const cancelAt = isDefined(subscriptionStatus?.cancelAt)
    ? new Date(subscriptionStatus.cancelAt)
    : null;

  const currentPeriodEnd = isDefined(subscriptionStatus?.currentPeriodEnd)
    ? new Date(subscriptionStatus.currentPeriodEnd)
    : null;

  const licenseExpiresAt = isDefined(subscriptionStatus?.expiresAt)
    ? new Date(subscriptionStatus.expiresAt)
    : null;

  const licenseExpiresAtDate = isDefined(licenseExpiresAt)
    ? licenseExpiresAt.toLocaleDateString()
    : '';

  const cancelAtDate =
    isCancelScheduled && isDefined(cancelAt)
      ? cancelAt.toLocaleDateString()
      : '';

  const cancellationMessage =
    isCancelScheduled && isDefined(cancelAt)
      ? t`Your premium features will remain active until ${cancelAtDate}.`
      : null;

  const cancellationOrPeriodEndDate = isCancelScheduled
    ? cancelAt
    : currentPeriodEnd;
  const cancellationOrPeriodEndDateLabel = isCancelScheduled
    ? t`Cancels on`
    : t`Renews on`;

  const handleActivate = useCallback(async () => {
    if (!enterpriseKey.trim()) return;

    setIsActivating(true);

    try {
      const result = await setEnterpriseKeyMutation({
        variables: { enterpriseKey: enterpriseKey.trim() },
      });

      if (result.data?.setEnterpriseKey.isValid === true) {
        enqueueToast({
          variant: 'success',
          children: t`Organization license activated successfully`,
        });
        setEnterpriseKey('');
        const { data: statusData } = await fetchSubscriptionStatus();

        setSubscriptionStatus(statusData?.enterpriseSubscriptionStatus ?? null);
        await loadCurrentUser();
      } else {
        enqueueToast({
          variant: 'error',
          children: t`Failed to activate Organization license. Please check your key or contact support.`,
        });
      }
    } catch (error) {
      const isServerBindingRejection =
        isGraphqlErrorOfType(error, 'ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER') ||
        isGraphqlErrorOfType(error, 'ENTERPRISE_MISSING_SERVER_ID') ||
        isGraphqlErrorOfType(
          error,
          'ENTERPRISE_DEV_REQUIRES_ACTIVE_PRODUCTION',
        ) ||
        isGraphqlErrorOfType(error, 'ENTERPRISE_DEV_SLOT_IN_USE');

      if (isServerBindingRejection) {
        setIsBoundToAnotherServer(
          isGraphqlErrorOfType(error, 'ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER'),
        );
        await loadCurrentUser();
        enqueueToast(getToastOptionsFromError({ error, duration: 10000 }));
      } else if (
        isGraphqlErrorOfType(error, 'CONFIG_VARIABLES_IN_DB_DISABLED')
      ) {
        enqueueToast(getToastOptionsFromError({ error, duration: 10000 }));
      } else {
        enqueueToast({
          variant: 'error',
          children: t`Error activating Organization license`,
        });
      }
    } finally {
      setIsActivating(false);
    }
  }, [
    enterpriseKey,
    setEnterpriseKeyMutation,
    enqueueToast,
    fetchSubscriptionStatus,
    loadCurrentUser,
    t,
  ]);

  const returnUrlPath = isAdminPanelTab
    ? getSettingsPath(SettingsPath.AdminPanelOrganization)
    : getSettingsPath(SettingsPath.Enterprise);

  const openBillingPortal = useCallback(async () => {
    try {
      const { data } = await fetchPortalSession({
        variables: { returnUrlPath },
      });

      const portalUrl = data?.enterprisePortalSession;

      if (portalUrl !== null && portalUrl !== undefined) {
        window.open(portalUrl, '_blank', 'noopener');
      } else {
        enqueueToast({
          variant: 'error',
          children: t`Could not open billing portal. Please check your Organization key is present, or contact support.`,
        });
      }
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Error opening billing portal`,
      });
    }
  }, [fetchPortalSession, enqueueToast, t, returnUrlPath]);

  const openCheckoutModal = useCallback(() => {
    openDialog(ENTERPRISE_PLAN_MODAL_ID);
  }, [openDialog]);

  const handleRefreshValidityToken = useCallback(async () => {
    setIsRefreshingToken(true);

    try {
      const { data } = await refreshValidityTokenMutation();

      if (data?.refreshEnterpriseValidityToken === true) {
        setIsBoundToAnotherServer(false);
        enqueueToast({
          variant: 'success',
          children: t`Validity token refreshed successfully`,
        });
        await loadCurrentUser();
      } else {
        enqueueToast({
          variant: 'error',
          children: t`Could not refresh validity token. Please contact support.`,
        });
      }
    } catch (error) {
      if (
        isGraphqlErrorOfType(error, 'ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER')
      ) {
        setIsBoundToAnotherServer(true);
        await loadCurrentUser();
        enqueueToast(getToastOptionsFromError({ error, duration: 10000 }));
      } else if (
        isGraphqlErrorOfType(error, 'ENTERPRISE_MISSING_SERVER_ID') ||
        isGraphqlErrorOfType(
          error,
          'ENTERPRISE_DEV_REQUIRES_ACTIVE_PRODUCTION',
        ) ||
        isGraphqlErrorOfType(error, 'ENTERPRISE_DEV_SLOT_IN_USE') ||
        isGraphqlErrorOfType(error, 'ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED')
      ) {
        enqueueToast(getToastOptionsFromError({ error, duration: 10000 }));
      } else {
        enqueueToast({
          variant: 'error',
          children: t`Error refreshing validity token. Please contact support.`,
        });
      }
    } finally {
      setIsRefreshingToken(false);
    }
  }, [refreshValidityTokenMutation, enqueueToast, loadCurrentUser, t]);

  const handleReleaseBinding = useCallback(async () => {
    setIsReleasing(true);

    try {
      const result = await releaseServerBindingMutation();

      if (result.data?.releaseEnterpriseServerBinding.isValid === true) {
        setIsBoundToAnotherServer(false);
        enqueueToast({
          variant: 'success',
          children: t`Organization key transferred to this server`,
        });
        const { data: statusData } = await fetchSubscriptionStatus();

        setSubscriptionStatus(statusData?.enterpriseSubscriptionStatus ?? null);
        await loadCurrentUser();
      } else {
        enqueueToast({
          variant: 'error',
          children: t`Could not transfer the Organization key. Please contact support.`,
        });
      }
    } catch (error) {
      if (isGraphqlErrorOfType(error, 'ENTERPRISE_RELEASE_RATE_LIMITED')) {
        enqueueToast({
          variant: 'error',
          children: t`You have reached the maximum number of server transfers allowed in the last 30 days for this Organization key. Please try again later or contact support.`,
        });
      } else {
        enqueueToast({
          variant: 'error',
          children: t`Error transferring the Organization key`,
        });
      }
    } finally {
      setIsReleasing(false);
    }
  }, [
    releaseServerBindingMutation,
    enqueueToast,
    fetchSubscriptionStatus,
    loadCurrentUser,
    t,
  ]);

  const handleSetInstanceType = useCallback(
    async (nextInstanceType: EnterpriseInstanceType) => {
      setIsUpdatingInstanceType(true);
      const previousInstanceType = instanceType;
      const previousIsInstanceTypeFromDb = isInstanceTypeFromDb;
      let instanceUpdateSuccess = false;
      let tokenRefreshSuccess = false;

      try {
        await updateInstanceTypeVariable(
          nextInstanceType,
          isInstanceTypeFromDb,
        );
        instanceUpdateSuccess = true;
        setInstanceType(nextInstanceType);
        setIsInstanceTypeFromDb(true);
        await loadCurrentUser();

        enqueueToast({
          variant: 'success',
          children:
            nextInstanceType === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
              ? t`Registered as a development instance. This instance will not be billed.`
              : t`Switched to a production instance.`,
        });

        await refreshValidityTokenMutation();
        tokenRefreshSuccess = true;
      } catch {
        if (!instanceUpdateSuccess) {
          enqueueToast({
            variant: 'error',
            children: t`Could not update the instance type`,
          });
        }
      } finally {
        if (instanceUpdateSuccess && !tokenRefreshSuccess) {
          try {
            if (previousIsInstanceTypeFromDb) {
              await updateInstanceTypeVariable(previousInstanceType, true);
            } else {
              await deleteInstanceTypeVariable();
            }
            setInstanceType(previousInstanceType);
            setIsInstanceTypeFromDb(previousIsInstanceTypeFromDb);
            await loadCurrentUser();
            enqueueToast({
              variant: 'error',
              children: t`Could not refresh validity token - reverted the instance type change.`,
            });
          } catch {
            enqueueToast({
              variant: 'error',
              children: t`Could not refresh validity token and could not revert the instance type change.`,
            });
          }
        }
        setIsUpdatingInstanceType(false);
      }
    },
    [
      instanceType,
      updateInstanceTypeVariable,
      deleteInstanceTypeVariable,
      isInstanceTypeFromDb,
      refreshValidityTokenMutation,
      loadCurrentUser,
      enqueueToast,
      t,
    ],
  );

  const activateKeySection = (
    <Section.Root>
      <Section.Header
        title={t`Activate Organization Key`}
        description={t`Paste your Organization key below to activate. Keep a copy of this key somewhere safe: the same key is reused to set up a development instance or to move your license to a replacement server.`}
      />
      <StyledInputContainer>
        <StyledInputWrapper>
          <SettingsTextInput
            instanceId="organization-key-input"
            value={enterpriseKey}
            onChange={(value) => setEnterpriseKey(value)}
            placeholder={t`Paste your Organization key here`}
            fullWidth
            onInputEnter={handleActivate}
          />
        </StyledInputWrapper>
        <StyledActivateButtonWrapper>
          <Button
            startIcon={<IconKey />}
            onClick={handleActivate}
            disabled={isActivating || !enterpriseKey.trim()}
            variant="solid"
            color="accent"
          >
            {isActivating ? t`Activating...` : t`Activate`}
          </Button>
        </StyledActivateButtonWrapper>
      </StyledInputContainer>
    </Section.Root>
  );

  const transferSection = (
    <Section.Root>
      <Section.Header
        title={t`Key in use on another server`}
        description={t`This Organization key is already bound to a different server instance. Releasing it here will transfer the license to this server and stop counting seats on the previous one.`}
      />
      <Button
        startIcon={<IconKey />}
        onClick={() =>
          openDialog(RELEASE_ENTERPRISE_BINDING_CONFIRMATION_MODAL_ID)
        }
        disabled={isReleasing}
        variant="outline"
        color="accent"
      >
        {isReleasing
          ? t`Transferring...`
          : t`Release & transfer to this server`}
      </Button>
    </Section.Root>
  );

  const enterpriseKeyInfoSection = (
    <Section.Root>
      <Section.Header
        title={t`Your Organization key`}
        description={t`This server has an Organization key configured. Make sure you keep a copy of it somewhere safe: you need the same key to activate a development instance or to move your license to a replacement server. If you no longer have access to your key, contact support.`}
      />
    </Section.Root>
  );

  const instanceTypeSection = (
    <Section.Root>
      <Section.Header
        title={t`Development instance`}
        description={
          instanceType === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
            ? t`This server is registered as a development instance and is not billed additionally. A subscription can have a single development instance in addition to its production one. Switching it back to a production instance will make its seats count toward billing.`
            : t`One subscription provides one Organization key that powers one production instance and one potential staging or test instance. To run a staging or test environment, install Twenty on a second server, activate it with this same Organization key, then register that server as a development instance. Development instances unlock premium features without extra billing and do not count toward your production seats.`
        }
      />
      {instanceType === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT ? (
        <Button
          onClick={() =>
            handleSetInstanceType(ENTERPRISE_INSTANCE_TYPE.PRODUCTION)
          }
          disabled={isUpdatingInstanceType}
          variant="outline"
        >
          {isUpdatingInstanceType
            ? t`Updating...`
            : t`Switch to production instance`}
        </Button>
      ) : (
        <Button
          onClick={() =>
            handleSetInstanceType(ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT)
          }
          disabled={isUpdatingInstanceType}
          variant="outline"
        >
          {isUpdatingInstanceType
            ? t`Updating...`
            : t`Register as development instance`}
        </Button>
      )}
    </Section.Root>
  );

  const renderContent = () => {
    if (!isStatusLoaded) {
      return null;
    }

    if (hasOrphanedValidityToken) {
      return (
        <>
          <Section.Root>
            <Section.Header
              title={t`Organization License`}
              description={t`Your premium features are active but your Organization key is missing or invalid. This may be expected, but if not, please set a valid signed Organization key to manage your subscription, or contact support.`}
            />
            <Button
              startIcon={<IconKey />}
              onClick={openCheckoutModal}
              variant="outline"
            >{t`Get Organization Key`}</Button>
          </Section.Root>
          {activateKeySection}
        </>
      );
    }

    if (!hasSignedEnterpriseKey) {
      return (
        <>
          <Section.Root>
            <Section.Header
              title={t`Get Organization`}
              description={t`Unlock premium features like SSO, row-level security, and audit logs.`}
            />
            <Button
              startIcon={<IconKey />}
              onClick={openCheckoutModal}
              variant="outline"
            >{t`Get Organization Key`}</Button>
          </Section.Root>
          {activateKeySection}
        </>
      );
    }

    if (isSubscriptionActiveOrTrialing && !hasValidityToken) {
      return (
        <>
          <Section.Root>
            <Section.Header
              title={t`Organization License`}
              description={t`Your subscription is active but your validity token is invalid or has expired. Try reloading it or contact support.`}
            />
            <Button
              startIcon={<IconKey />}
              onClick={handleRefreshValidityToken}
              disabled={isRefreshingToken}
              variant="outline"
              color="accent"
            >
              {isRefreshingToken ? t`Reloading...` : t`Reload validity token`}
            </Button>
            <StyledSpacer />
            <SubscriptionInfoContainer>
              <SubscriptionInfoRowContainer
                label={t`Status`}
                Icon={IconCheck}
                currentValue={
                  <StyledStatusContainer>
                    <StyledStatusDot variant="active" />
                    {stripeStatus === 'trialing' ? (
                      <Trans>Trial</Trans>
                    ) : (
                      <Trans>Active</Trans>
                    )}
                  </StyledStatusContainer>
                }
              />
              {licensee && (
                <SubscriptionInfoRowContainer
                  label={t`Licensee`}
                  Icon={IconUser}
                  currentValue={licensee}
                />
              )}
              {isDefined(cancellationOrPeriodEndDate) && (
                <SubscriptionInfoRowContainer
                  label={cancellationOrPeriodEndDateLabel}
                  Icon={IconCalendarRepeat}
                  currentValue={cancellationOrPeriodEndDate.toLocaleDateString()}
                />
              )}
            </SubscriptionInfoContainer>
          </Section.Root>
          {isBoundToAnotherServer && transferSection}
          <Section.Root>
            <Section.Header
              title={t`Manage billing information`}
              description={t`Edit payment method, see your invoices and more`}
            />
            <Button
              startIcon={<IconCreditCard />}
              onClick={openBillingPortal}
              variant="outline"
            >{t`View billing details`}</Button>
          </Section.Root>
        </>
      );
    }

    if (isSubscriptionActiveOrTrialing) {
      return (
        <>
          <Section.Root>
            <Section.Header
              title={t`Organization License`}
              description={
                isCancelScheduled
                  ? t`Your subscription is scheduled for cancellation`
                  : t`Your premium features are active`
              }
            />
            <SubscriptionInfoContainer>
              <SubscriptionInfoRowContainer
                label={t`Status`}
                Icon={IconCheck}
                currentValue={
                  <StyledStatusContainer>
                    <StyledStatusDot
                      variant={isCancelScheduled ? 'inactive' : 'active'}
                    />
                    {isCancelScheduled ? (
                      <Trans>Cancelling</Trans>
                    ) : stripeStatus === 'trialing' ? (
                      <Trans>Trial</Trans>
                    ) : (
                      <Trans>Active</Trans>
                    )}
                  </StyledStatusContainer>
                }
              />
              {licensee && (
                <SubscriptionInfoRowContainer
                  label={t`Licensee`}
                  Icon={IconUser}
                  currentValue={licensee}
                />
              )}
              {isDefined(cancellationOrPeriodEndDate) && (
                <SubscriptionInfoRowContainer
                  label={cancellationOrPeriodEndDateLabel}
                  Icon={IconCalendarRepeat}
                  currentValue={cancellationOrPeriodEndDate.toLocaleDateString()}
                />
              )}
            </SubscriptionInfoContainer>
            {cancellationMessage && (
              <StyledCancellationNotice>
                {cancellationMessage}
              </StyledCancellationNotice>
            )}
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Manage billing information`}
              description={t`Edit payment method, see your invoices and more`}
            />
            <Button
              startIcon={<IconCreditCard />}
              onClick={openBillingPortal}
              variant="outline"
            >{t`View billing details`}</Button>
          </Section.Root>
          {!isCancelScheduled && (
            <Section.Root>
              <Section.Header
                title={t`Cancel your subscription`}
                description={t`Your premium features will be disabled`}
              />
              <Button
                startIcon={<IconCircleX />}
                onClick={openBillingPortal}
                variant="outline"
                color="danger"
              >{t`Cancel Plan`}</Button>
            </Section.Root>
          )}
        </>
      );
    }

    if (isCanceled) {
      return (
        <>
          <Section.Root>
            <Section.Header
              title={t`Organization License`}
              description={t`Your Organization subscription has been canceled.`}
            />
            <SubscriptionInfoContainer>
              <SubscriptionInfoRowContainer
                label={t`Status`}
                Icon={IconCheck}
                currentValue={
                  <StyledStatusContainer>
                    <StyledStatusDot variant="inactive" />
                    <Trans>Canceled</Trans>
                  </StyledStatusContainer>
                }
              />
              <SubscriptionInfoRowContainer
                label={t`Billing history`}
                Icon={IconCreditCard}
                currentValue={
                  <Button
                    size="sm"
                    onClick={openBillingPortal}
                    variant="outline"
                  >{t`View invoices`}</Button>
                }
              />
            </SubscriptionInfoContainer>
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Get Organization`}
              description={t`Start a new Organization subscription to re-enable premium features.`}
            />
            <Button
              startIcon={<IconKey />}
              onClick={openCheckoutModal}
              variant="outline"
            >{t`Get Organization Key`}</Button>
          </Section.Root>
          {activateKeySection}
        </>
      );
    }

    if (isPastDue) {
      return (
        <>
          <Section.Root>
            <Section.Header
              title={t`Organization License`}
              description={
                hasValidityToken
                  ? t`A payment on your subscription failed. Your premium features stay active while we retry it.`
                  : t`There is a payment issue with your subscription. Your premium features are disabled. Settle the outstanding invoice to restore them, before the subscription is cancelled: a cancelled subscription cannot be reactivated and you would need to start a new one.`
              }
            />
            <SubscriptionInfoContainer>
              <SubscriptionInfoRowContainer
                label={t`Status`}
                Icon={IconCheck}
                currentValue={
                  <StyledStatusContainer>
                    <StyledStatusDot
                      variant={hasValidityToken ? 'warning' : 'inactive'}
                    />
                    <Trans>Payment issue</Trans>
                  </StyledStatusContainer>
                }
              />
              {hasValidityToken && isDefined(licenseExpiresAt) && (
                <SubscriptionInfoRowContainer
                  label={t`Features active until`}
                  Icon={IconCalendarRepeat}
                  currentValue={licenseExpiresAtDate}
                />
              )}
              <SubscriptionInfoRowContainer
                label={t`Billing history`}
                Icon={IconCreditCard}
                currentValue={
                  <Button
                    size="sm"
                    onClick={openBillingPortal}
                    variant="outline"
                  >{t`View invoices`}</Button>
                }
              />
            </SubscriptionInfoContainer>
            {hasValidityToken && isDefined(licenseExpiresAt) && (
              <StyledCancellationNotice>
                {t`Update your payment method before ${licenseExpiresAtDate} to avoid losing access.`}
              </StyledCancellationNotice>
            )}
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Update payment method`}
              description={
                hasValidityToken
                  ? t`Fix the payment issue to keep your premium features active.`
                  : t`Fix the payment issue to restore your premium features.`
              }
            />
            <Button
              startIcon={<IconCreditCard />}
              onClick={openBillingPortal}
              variant="outline"
              color="accent"
            >{t`Go to billing portal`}</Button>
          </Section.Root>
        </>
      );
    }

    if (isIncomplete) {
      return (
        <>
          <Section.Root>
            <Section.Header
              title={t`Organization License`}
              description={t`Your subscription setup was not completed.`}
            />
            <SubscriptionInfoContainer>
              <SubscriptionInfoRowContainer
                label={t`Status`}
                Icon={IconCheck}
                currentValue={
                  <StyledStatusContainer>
                    <StyledStatusDot variant="inactive" />
                    <Trans>Incomplete</Trans>
                  </StyledStatusContainer>
                }
              />
            </SubscriptionInfoContainer>
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Get Organization`}
              description={t`Start a new Organization subscription.`}
            />
            <Button
              startIcon={<IconKey />}
              onClick={openCheckoutModal}
            >{t`Get Organization Key`}</Button>
          </Section.Root>
          {activateKeySection}
        </>
      );
    }

    return (
      <>
        <Section.Root>
          <Section.Header
            title={t`Organization License`}
            description={(() => {
              const statusLabel = stripeStatus ?? 'unknown';

              return t`Your subscription status is: ${statusLabel}`;
            })()}
          />
          <Button
            startIcon={<IconCreditCard />}
            onClick={openBillingPortal}
            variant="outline"
          >{t`Go to billing portal`}</Button>
        </Section.Root>
        {activateKeySection}
      </>
    );
  };

  const hasEnterpriseLicense = hasSignedEnterpriseKey || hasValidityToken;

  const innerContent = (
    <>
      <EnterprisePlanModal />
      <ConfirmationDialog
        dialogId={RELEASE_ENTERPRISE_BINDING_CONFIRMATION_MODAL_ID}
        title={t`Release & transfer Organization key`}
        subtitle={t`This Organization key is currently bound to a different server instance. Transferring it here will release it from the previous server and stop counting seats on it. Are you sure you want to continue?`}
        confirmButtonText={t`Release & transfer`}
        confirmButtonColor="accent"
        loading={isReleasing}
        onConfirmClick={handleReleaseBinding}
      />
      {renderContent()}
      {hasSignedEnterpriseKey && enterpriseKeyInfoSection}
      {hasEnterpriseLicense && instanceTypeSection}
    </>
  );

  if (isAdminPanelTab) {
    return innerContent;
  }

  return (
    <SettingsPageLayout
      title={t`Organization`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: <Trans>Organization</Trans> },
      ]}
    >
      <SettingsPageContainer>{innerContent}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
