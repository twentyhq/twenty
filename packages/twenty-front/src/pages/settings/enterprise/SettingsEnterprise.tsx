import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { SubscriptionInfoRowContainer } from '@/billing/components/internal/SubscriptionInfoRowContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  ENTERPRISE_PLAN_MODAL_ID,
  EnterprisePlanModal,
} from '@/settings/enterprise/components/EnterprisePlanModal';
import { SET_ENTERPRISE_KEY } from '@/settings/enterprise/graphql/mutations/setEnterpriseKey';
import { ENTERPRISE_PORTAL_SESSION } from '@/settings/enterprise/graphql/queries/enterprisePortalSession';
import { ENTERPRISE_SUBSCRIPTION_STATUS } from '@/settings/enterprise/graphql/queries/enterpriseSubscriptionStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import styled from '@emotion/styled';
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

type SettingsEnterpriseProps = {
  isAdminPanelTab?: boolean;
};

const StyledStatusDot = styled.div<{ isActive: boolean }>`
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.color.green : theme.color.red};
  border-radius: 50%;
  height: 8px;
  width: 8px;
`;

const StyledStatusContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledCancellationNotice = styled.div`
  color: ${({ theme }) => theme.font.color.danger};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledInputWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledActivateButtonWrapper = styled.div`
  flex-shrink: 0;
`;

export const SettingsEnterprise = ({
  isAdminPanelTab = false,
}: SettingsEnterpriseProps = {}) => {
  const { t } = useLingui();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const [enterpriseKey, setEnterpriseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [setEnterpriseKeyMutation] = useMutation(SET_ENTERPRISE_KEY);
  const [fetchPortalSession] = useLazyQuery(ENTERPRISE_PORTAL_SESSION);
  const { openModal } = useModal();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const isActive = currentWorkspace?.hasActivatedAndValidEnterpriseKey === true;

  const { data: subscriptionStatusData } = useQuery(
    ENTERPRISE_SUBSCRIPTION_STATUS,
    { skip: !isActive },
  );

  const subscriptionStatus =
    subscriptionStatusData?.enterpriseSubscriptionStatus;
  const licensee = subscriptionStatus?.licensee ?? null;
  const expiresAt = subscriptionStatus?.expiresAt
    ? new Date(subscriptionStatus.expiresAt)
    : null;
  const isCancelScheduled =
    subscriptionStatus?.isCancellationScheduled === true;

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
      } else {
        enqueueErrorSnackBar({
          message: t`Failed to activate enterprise license. Please check your key or contact support.`,
        });
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Error activating enterprise license`,
      });
    } finally {
      setIsActivating(false);
    }
  }, [
    enterpriseKey,
    setEnterpriseKeyMutation,
    enqueueErrorSnackBar,
    enqueueSuccessSnackBar,
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
          message: t`Could not open billing portal. Please contact support.`,
        });
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Error opening billing portal`,
      });
    }
  }, [fetchPortalSession, enqueueErrorSnackBar, t, returnUrlPath]);

  // Portal first (reactivate or manage), then plan selection modal (new subscription)
  const openPortalOrCheckout = useCallback(async () => {
    try {
      const { data: portalData } = await fetchPortalSession({
        variables: { returnUrlPath },
      });

      const portalUrl = portalData?.enterprisePortalSession;

      if (portalUrl !== null && portalUrl !== undefined) {
        window.open(portalUrl, '_blank', 'noopener');

        return;
      }

      openModal(ENTERPRISE_PLAN_MODAL_ID);
    } catch {
      enqueueErrorSnackBar({
        message: t`Error opening Stripe`,
      });
    }
  }, [fetchPortalSession, openModal, enqueueErrorSnackBar, t, returnUrlPath]);

  const innerContent = (
    <>
      <EnterprisePlanModal />
      {isActive ? (
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
      ) : (
        <>
          <Section>
            <H2Title
              title={t`Get Enterprise`}
              description={t`Unlock enterprise features like SSO, row-level security, and audit logs. If your subscription expired, you will be redirected to Stripe to reactivate it.`}
            />
            <Button
              Icon={IconKey}
              title={t`Get Enterprise Key`}
              variant="secondary"
              onClick={openPortalOrCheckout}
            />
          </Section>
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
        </>
      )}
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
