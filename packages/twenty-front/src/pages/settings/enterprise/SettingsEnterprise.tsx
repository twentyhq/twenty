import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useState } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { SubscriptionInfoRowContainer } from '@/billing/components/internal/SubscriptionInfoRowContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  ENTERPRISE_PLAN_MODAL_ID,
  EnterprisePlanModal,
} from '@/settings/enterprise/components/EnterprisePlanModal';
import { REFRESH_ENTERPRISE_VALIDITY_TOKEN } from '@/settings/enterprise/graphql/mutations/refreshEnterpriseValidityToken';
import { SET_ENTERPRISE_KEY } from '@/settings/enterprise/graphql/mutations/setEnterpriseKey';
import { ENTERPRISE_PORTAL_SESSION } from '@/settings/enterprise/graphql/queries/enterprisePortalSession';
import { ENTERPRISE_SUBSCRIPTION_STATUS } from '@/settings/enterprise/graphql/queries/enterpriseSubscriptionStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { CombinedGraphQLErrors } from '@apollo/client';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconCalendarRepeat,
  IconCheck,
  IconCircleX,
  IconCreditCard,
  IconKey,
  IconUser,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  const [fetchPortalSession] = useLazyQuery<{
    enterprisePortalSession: string | null;
  }>(ENTERPRISE_PORTAL_SESSION);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const { openModal } = useModal();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { loadCurrentUser } = useLoadCurrentUser();

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
      if (
        CombinedGraphQLErrors.is(error) &&
        error.errors?.[0]?.extensions?.subCode ===
          'CONFIG_VARIABLES_IN_DB_DISABLED'
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
        enqueueSuccessSnackBar({
          message: t`Validity token refreshed successfully`,
        });
        await loadCurrentUser();
      } else {
        enqueueErrorSnackBar({
          message: t`Could not refresh validity token. Please contact support.`,
        });
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Error refreshing validity token. Please contact support.`,
      });
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

  const activateKeySection = (
    <Section>
      <H2Title
        title={t`Activate Enterprise Key`}
        description={t`Paste your enterprise key below to activate`}
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
            variant="secondary"
            accent="blue"
            onClick={handleActivate}
            disabled={isActivating || !enterpriseKey.trim()}
          />
        </StyledActivateButtonWrapper>
      </StyledInputContainer>
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
              variant="secondary"
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

  const innerContent = (
    <>
      <EnterprisePlanModal />
      {renderContent()}
    </>
  );

  if (isAdminPanelTab) {
    return innerContent;
  }

  return (
    <SubMenuTopBarContainer
      title={t`Enterprise`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Enterprise</Trans> },
      ]}
    >
      <SettingsPageContainer>{innerContent}</SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
