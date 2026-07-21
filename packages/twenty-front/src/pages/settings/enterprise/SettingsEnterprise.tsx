import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useState } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
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
import { SET_ENTERPRISE_KEY } from '@/settings/enterprise/graphql/mutations/setEnterpriseKey';
import { ENTERPRISE_PORTAL_SESSION } from '@/settings/enterprise/graphql/queries/enterprisePortalSession';
import { ENTERPRISE_SUBSCRIPTION_STATUS } from '@/settings/enterprise/graphql/queries/enterpriseSubscriptionStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
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
import {
  IconCalendarRepeat,
  IconCheck,
  IconCircleX,
  IconCreditCard,
  IconKey,
  IconUser,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
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

const StyledStatusDot = styled.div<{ isActive: boolean }>`
  background-color: ${({ isActive }) =>
    isActive ? themeCssVariables.color.green : themeCssVariables.color.red};
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
  const { openModal } = useModal();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
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
  const expiresAt = subscriptionStatus?.expiresAt
    ? new Date(subscriptionStatus.expiresAt)
    : null;

  const cancelAt = isDefined(subscriptionStatus?.cancelAt)
    ? new Date(subscriptionStatus.cancelAt)
    : null;

  const cancelAtDate =
    isCancelScheduled && isDefined(cancelAt)
      ? cancelAt.toLocaleDateString()
      : '';

  const cancellationMessage =
    isCancelScheduled && isDefined(cancelAt)
      ? t`Your enterprise features will remain active until ${cancelAtDate}.`
      : null;

  const handleActivate = useCallback(async () => {
    if (!enterpriseKey.trim()) return;

    setIsActivating(true);

    try {
      const result = await setEnterpriseKeyMutation({
        variables: { enterpriseKey: enterpriseKey.trim() },
      });

      if (result.data?.setEnterpriseKey.isValid === true) {
        enqueueSuccessSnackBar({
          message: t`Enterprise license activated successfully`,
        });
        setEnterpriseKey('');
        const { data: statusData } = await fetchSubscriptionStatus();

        setSubscriptionStatus(statusData?.enterpriseSubscriptionStatus ?? null);
        await loadCurrentUser();
      } else {
        enqueueErrorSnackBar({
          message: t`Failed to activate enterprise license. Please check your key or contact support.`,
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
        enqueueErrorSnackBar({
          apolloError: error,
          options: { duration: 10000 },
        });
      } else if (
        isGraphqlErrorOfType(error, 'CONFIG_VARIABLES_IN_DB_DISABLED')
      ) {
        enqueueErrorSnackBar({
          apolloError: error,
          options: { duration: 10000 },
        });
      } else {
        enqueueErrorSnackBar({
          message: t`Error activating enterprise license`,
        });
      }
    } finally {
      setIsActivating(false);
    }
  }, [
    enterpriseKey,
    setEnterpriseKeyMutation,
    enqueueErrorSnackBar,
    enqueueSuccessSnackBar,
    fetchSubscriptionStatus,
    loadCurrentUser,
    t,
  ]);

  const returnUrlPath = isAdminPanelTab
    ? getSettingsPath(SettingsPath.AdminPanelEnterprise)
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
        enqueueErrorSnackBar({
          message: t`Could not open billing portal. Please check your enterprise key is present, or contact support.`,
        });
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Error opening billing portal`,
      });
    }
  }, [fetchPortalSession, enqueueErrorSnackBar, t, returnUrlPath]);

  const openCheckoutModal = useCallback(() => {
    openModal(ENTERPRISE_PLAN_MODAL_ID);
  }, [openModal]);

  const handleRefreshValidityToken = useCallback(async () => {
    setIsRefreshingToken(true);

    try {
      const { data } = await refreshValidityTokenMutation();

      if (data?.refreshEnterpriseValidityToken === true) {
        setIsBoundToAnotherServer(false);
        enqueueSuccessSnackBar({
          message: t`Validity token refreshed successfully`,
        });
        await loadCurrentUser();
      } else {
        enqueueErrorSnackBar({
          message: t`Could not refresh validity token. Please contact support.`,
        });
      }
    } catch (error) {
      if (
        isGraphqlErrorOfType(error, 'ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER')
      ) {
        setIsBoundToAnotherServer(true);
        await loadCurrentUser();
        enqueueErrorSnackBar({
          apolloError: error,
          options: { duration: 10000 },
        });
      } else if (
        isGraphqlErrorOfType(error, 'ENTERPRISE_MISSING_SERVER_ID') ||
        isGraphqlErrorOfType(
          error,
          'ENTERPRISE_DEV_REQUIRES_ACTIVE_PRODUCTION',
        ) ||
        isGraphqlErrorOfType(error, 'ENTERPRISE_DEV_SLOT_IN_USE') ||
        isGraphqlErrorOfType(error, 'ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED')
      ) {
        enqueueErrorSnackBar({
          apolloError: error,
          options: { duration: 10000 },
        });
      } else {
        enqueueErrorSnackBar({
          message: t`Error refreshing validity token. Please contact support.`,
        });
      }
    } finally {
      setIsRefreshingToken(false);
    }
  }, [
    refreshValidityTokenMutation,
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    loadCurrentUser,
    t,
  ]);

  const handleReleaseBinding = useCallback(async () => {
    setIsReleasing(true);

    try {
      const result = await releaseServerBindingMutation();

      if (result.data?.releaseEnterpriseServerBinding.isValid === true) {
        setIsBoundToAnotherServer(false);
        enqueueSuccessSnackBar({
          message: t`Enterprise key transferred to this server`,
        });
        const { data: statusData } = await fetchSubscriptionStatus();

        setSubscriptionStatus(statusData?.enterpriseSubscriptionStatus ?? null);
        await loadCurrentUser();
      } else {
        enqueueErrorSnackBar({
          message: t`Could not transfer the enterprise key. Please contact support.`,
        });
      }
    } catch (error) {
      if (isGraphqlErrorOfType(error, 'ENTERPRISE_RELEASE_RATE_LIMITED')) {
        enqueueErrorSnackBar({
          message: t`You have reached the maximum number of server transfers allowed in the last 30 days for this enterprise key. Please try again later or contact support.`,
        });
      } else {
        enqueueErrorSnackBar({
          message: t`Error transferring the enterprise key`,
        });
      }
    } finally {
      setIsReleasing(false);
    }
  }, [
    releaseServerBindingMutation,
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
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

        enqueueSuccessSnackBar({
          message:
            nextInstanceType === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
              ? t`Registered as a development instance. This instance will not be billed.`
              : t`Switched to a production instance.`,
        });

        await refreshValidityTokenMutation();
        tokenRefreshSuccess = true;
      } catch {
        if (!instanceUpdateSuccess) {
          enqueueErrorSnackBar({
            message: t`Could not update the instance type`,
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
            enqueueErrorSnackBar({
              message: t`Could not refresh validity token - reverted the instance type change.`,
            });
          } catch {
            enqueueErrorSnackBar({
              message: t`Could not refresh validity token and could not revert the instance type change.`,
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
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
      t,
    ],
  );

  const activateKeySection = (
    <Section>
      <H2Title
        title={t`Activate Enterprise Key`}
        description={t`Paste your enterprise key below to activate. Keep a copy of this key somewhere safe: the same key is reused to set up a development instance or to move your license to a replacement server.`}
      />
      <StyledInputContainer>
        <StyledInputWrapper>
          <SettingsTextInput
            instanceId="enterprise-key-input"
            value={enterpriseKey}
            onChange={(value) => setEnterpriseKey(value)}
            placeholder={t`Paste your enterprise key here`}
            fullWidth
            onInputEnter={handleActivate}
          />
        </StyledInputWrapper>
        <StyledActivateButtonWrapper>
          <Button
            Icon={IconKey}
            title={isActivating ? t`Activating...` : t`Activate`}
            accent="blue"
            onClick={handleActivate}
            disabled={isActivating || !enterpriseKey.trim()}
          />
        </StyledActivateButtonWrapper>
      </StyledInputContainer>
    </Section>
  );

  const transferSection = (
    <Section>
      <H2Title
        title={t`Key in use on another server`}
        description={t`This enterprise key is already bound to a different server instance. Releasing it here will transfer the license to this server and stop counting seats on the previous one.`}
      />
      <Button
        Icon={IconKey}
        title={
          isReleasing
            ? t`Transferring...`
            : t`Release & transfer to this server`
        }
        variant="secondary"
        accent="blue"
        onClick={() =>
          openModal(RELEASE_ENTERPRISE_BINDING_CONFIRMATION_MODAL_ID)
        }
        disabled={isReleasing}
      />
    </Section>
  );

  const enterpriseKeyInfoSection = (
    <Section>
      <H2Title
        title={t`Your enterprise key`}
        description={t`This server has an enterprise key configured. Make sure you keep a copy of it somewhere safe: you need the same key to activate a development instance or to move your license to a replacement server. If you no longer have access to your key, contact support.`}
      />
    </Section>
  );

  const instanceTypeSection = (
    <Section>
      <H2Title
        title={t`Development instance`}
        description={
          instanceType === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
            ? t`This server is registered as a development instance and is not billed additionally. A subscription can have a single development instance in addition to its production one. Switching it back to a production instance will make its seats count toward billing.`
            : t`One subscription provides one enterprise key that powers one production instance and one potential staging or test instance. To run a staging or test environment, install Twenty on a second server, activate it with this same enterprise key, then register that server as a development instance. Development instances unlock enterprise features without extra billing and do not count toward your production seats.`
        }
      />
      {instanceType === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT ? (
        <Button
          title={
            isUpdatingInstanceType
              ? t`Updating...`
              : t`Switch to production instance`
          }
          variant="secondary"
          onClick={() =>
            handleSetInstanceType(ENTERPRISE_INSTANCE_TYPE.PRODUCTION)
          }
          disabled={isUpdatingInstanceType}
        />
      ) : (
        <Button
          title={
            isUpdatingInstanceType
              ? t`Updating...`
              : t`Register as development instance`
          }
          variant="secondary"
          onClick={() =>
            handleSetInstanceType(ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT)
          }
          disabled={isUpdatingInstanceType}
        />
      )}
    </Section>
  );

  const renderContent = () => {
    if (!isStatusLoaded) {
      return null;
    }

    if (hasOrphanedValidityToken) {
      return (
        <>
          <Section>
            <H2Title
              title={t`Enterprise License`}
              description={t`Your enterprise features are active but your enterprise key is missing or invalid. This may be expected, but if not, please set a valid signed enterprise key to manage your subscription, or contact support.`}
            />
            <Button
              Icon={IconKey}
              title={t`Get Enterprise Key`}
              variant="secondary"
              onClick={openCheckoutModal}
            />
          </Section>
          {activateKeySection}
        </>
      );
    }

    if (!hasSignedEnterpriseKey) {
      return (
        <>
          <Section>
            <H2Title
              title={t`Get Enterprise`}
              description={t`Unlock enterprise features like SSO, row-level security, and audit logs.`}
            />
            <Button
              Icon={IconKey}
              title={t`Get Enterprise Key`}
              variant="secondary"
              onClick={openCheckoutModal}
            />
          </Section>
          {activateKeySection}
        </>
      );
    }

    if (isSubscriptionActiveOrTrialing && !hasValidityToken) {
      return (
        <>
          <Section>
            <H2Title
              title={t`Enterprise License`}
              description={t`Your subscription is active but your validity token is invalid or has expired. Try reloading it or contact support.`}
            />
            <Button
              Icon={IconKey}
              title={
                isRefreshingToken ? t`Reloading...` : t`Reload validity token`
              }
              variant="secondary"
              accent="blue"
              onClick={handleRefreshValidityToken}
              disabled={isRefreshingToken}
            />
            <StyledSpacer />
            <SubscriptionInfoContainer>
              <SubscriptionInfoRowContainer
                label={t`Status`}
                Icon={IconCheck}
                currentValue={
                  <StyledStatusContainer>
                    <StyledStatusDot isActive={true} />
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
              {expiresAt && (
                <SubscriptionInfoRowContainer
                  label={t`Valid until`}
                  Icon={IconCalendarRepeat}
                  currentValue={new Date(expiresAt).toLocaleDateString()}
                />
              )}
            </SubscriptionInfoContainer>
          </Section>
          {isBoundToAnotherServer && transferSection}
          <Section>
            <H2Title
              title={t`Manage billing information`}
              description={t`Edit payment method, see your invoices and more`}
            />
            <Button
              Icon={IconCreditCard}
              title={t`View billing details`}
              variant="secondary"
              onClick={openBillingPortal}
            />
          </Section>
        </>
      );
    }

    if (isSubscriptionActiveOrTrialing) {
      return (
        <>
          <Section>
            <H2Title
              title={t`Enterprise License`}
              description={
                isCancelScheduled
                  ? t`Your subscription is scheduled for cancellation`
                  : t`Your enterprise features are active`
              }
            />
            <SubscriptionInfoContainer>
              <SubscriptionInfoRowContainer
                label={t`Status`}
                Icon={IconCheck}
                currentValue={
                  <StyledStatusContainer>
                    <StyledStatusDot isActive={!isCancelScheduled} />
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
              {expiresAt && (
                <SubscriptionInfoRowContainer
                  label={isCancelScheduled ? t`Cancels on` : t`Valid until`}
                  Icon={IconCalendarRepeat}
                  currentValue={new Date(expiresAt).toLocaleDateString()}
                />
              )}
            </SubscriptionInfoContainer>
            {cancellationMessage && (
              <StyledCancellationNotice>
                {cancellationMessage}
              </StyledCancellationNotice>
            )}
          </Section>
          <Section>
            <H2Title
              title={t`Manage billing information`}
              description={t`Edit payment method, see your invoices and more`}
            />
            <Button
              Icon={IconCreditCard}
              title={t`View billing details`}
              variant="secondary"
              onClick={openBillingPortal}
            />
          </Section>
          {!isCancelScheduled && (
            <Section>
              <H2Title
                title={t`Cancel your subscription`}
                description={t`Your enterprise features will be disabled`}
              />
              <Button
                Icon={IconCircleX}
                title={t`Cancel Plan`}
                variant="secondary"
                accent="danger"
                onClick={openBillingPortal}
              />
            </Section>
          )}
        </>
      );
    }

    if (isCanceled) {
      return (
        <>
          <Section>
            <H2Title
              title={t`Enterprise License`}
              description={t`Your enterprise subscription has been canceled.`}
            />
            <SubscriptionInfoContainer>
              <SubscriptionInfoRowContainer
                label={t`Status`}
                Icon={IconCheck}
                currentValue={
                  <StyledStatusContainer>
                    <StyledStatusDot isActive={false} />
                    <Trans>Canceled</Trans>
                  </StyledStatusContainer>
                }
              />
              <SubscriptionInfoRowContainer
                label={t`Billing history`}
                Icon={IconCreditCard}
                currentValue={
                  <Button
                    title={t`View invoices`}
                    variant="secondary"
                    size="small"
                    onClick={openBillingPortal}
                  />
                }
              />
            </SubscriptionInfoContainer>
          </Section>
          <Section>
            <H2Title
              title={t`Get Enterprise`}
              description={t`Start a new enterprise subscription to re-enable enterprise features.`}
            />
            <Button
              Icon={IconKey}
              title={t`Get Enterprise Key`}
              variant="secondary"
              onClick={openCheckoutModal}
            />
          </Section>
          {activateKeySection}
        </>
      );
    }

    if (isPastDue) {
      return (
        <>
          <Section>
            <H2Title
              title={t`Enterprise License`}
              description={t`There is a payment issue with your subscription. Please update your payment method.`}
            />
            <SubscriptionInfoContainer>
              <SubscriptionInfoRowContainer
                label={t`Status`}
                Icon={IconCheck}
                currentValue={
                  <StyledStatusContainer>
                    <StyledStatusDot isActive={false} />
                    <Trans>Payment issue</Trans>
                  </StyledStatusContainer>
                }
              />
            </SubscriptionInfoContainer>
          </Section>
          <Section>
            <H2Title
              title={t`Update payment method`}
              description={t`Fix the payment issue to keep your enterprise features active.`}
            />
            <Button
              Icon={IconCreditCard}
              title={t`Go to billing portal`}
              variant="secondary"
              accent="blue"
              onClick={openBillingPortal}
            />
          </Section>
        </>
      );
    }

    if (isIncomplete) {
      return (
        <>
          <Section>
            <H2Title
              title={t`Enterprise License`}
              description={t`Your subscription setup was not completed.`}
            />
            <SubscriptionInfoContainer>
              <SubscriptionInfoRowContainer
                label={t`Status`}
                Icon={IconCheck}
                currentValue={
                  <StyledStatusContainer>
                    <StyledStatusDot isActive={false} />
                    <Trans>Incomplete</Trans>
                  </StyledStatusContainer>
                }
              />
            </SubscriptionInfoContainer>
          </Section>
          <Section>
            <H2Title
              title={t`Get Enterprise`}
              description={t`Start a new enterprise subscription.`}
            />
            <Button
              Icon={IconKey}
              title={t`Get Enterprise Key`}
              onClick={openCheckoutModal}
            />
          </Section>
          {activateKeySection}
        </>
      );
    }

    return (
      <>
        <Section>
          <H2Title
            title={t`Enterprise License`}
            description={(() => {
              const statusLabel = stripeStatus ?? 'unknown';

              return t`Your subscription status is: ${statusLabel}`;
            })()}
          />
          <Button
            Icon={IconCreditCard}
            title={t`Go to billing portal`}
            variant="secondary"
            onClick={openBillingPortal}
          />
        </Section>
        {activateKeySection}
      </>
    );
  };

  const hasEnterpriseLicense = hasSignedEnterpriseKey || hasValidityToken;

  const innerContent = (
    <>
      <EnterprisePlanModal />
      <ConfirmationModal
        modalInstanceId={RELEASE_ENTERPRISE_BINDING_CONFIRMATION_MODAL_ID}
        title={t`Release & transfer enterprise key`}
        subtitle={t`This enterprise key is currently bound to a different server instance. Transferring it here will release it from the previous server and stop counting seats on it. Are you sure you want to continue?`}
        confirmButtonText={t`Release & transfer`}
        confirmButtonAccent="blue"
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
      title={t`Enterprise`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: <Trans>Enterprise</Trans> },
      ]}
    >
      <SettingsPageContainer>{innerContent}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
