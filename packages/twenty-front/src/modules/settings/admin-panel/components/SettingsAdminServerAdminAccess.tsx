import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { TwoFactorAuthenticationVerificationCodeDash } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeDash';
import { TwoFactorAuthenticationVerificationCodeSlot } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeSlot';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { OTPInput } from 'input-otp';
import { useState } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  GetServerAdminsDocument,
  UpdateServerAdminAccessDocument,
} from '~/generated-admin/graphql';

type ServerAdminAccessField = 'canAccessFullAdminPanel' | 'canImpersonate';

type PendingServerAdminChange = {
  field: ServerAdminAccessField;
  nextValue: boolean;
};

const SERVER_ADMIN_ACCESS_CONFIRMATION_MODAL_ID =
  'server-admin-access-confirmation';

const StyledConfirmationContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledOTPContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const SettingsAdminServerAdminAccess = ({
  userId,
  userLabel,
}: {
  userId: string;
  userLabel: string;
}) => {
  const apolloAdminClient = useApolloAdminClient();
  const { openModal } = useModal();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [pendingChange, setPendingChange] =
    useState<PendingServerAdminChange | null>(null);
  const [otp, setOtp] = useState('');

  const { data, loading, refetch } = useQuery(GetServerAdminsDocument, {
    client: apolloAdminClient,
  });

  const [updateServerAdminAccess] = useMutation(
    UpdateServerAdminAccessDocument,
    { client: apolloAdminClient },
  );

  const serverAdmins = data?.getServerAdmins ?? [];
  // A user with no access simply isn't in getServerAdmins, so both flags
  // default to false — which is exactly what we want to render for them.
  const currentAccess = serverAdmins.find((admin) => admin.id === userId);
  const canAccessFullAdminPanel =
    currentAccess?.canAccessFullAdminPanel ?? false;
  const canImpersonate = currentAccess?.canImpersonate ?? false;
  const fullAdminCount = serverAdmins.filter(
    (admin) => admin.canAccessFullAdminPanel,
  ).length;
  const isLastFullAdmin = canAccessFullAdminPanel && fullAdminCount <= 1;

  const requestChange = (field: ServerAdminAccessField, nextValue: boolean) => {
    setOtp('');
    setPendingChange({ field, nextValue });
    openModal(SERVER_ADMIN_ACCESS_CONFIRMATION_MODAL_ID);
  };

  const handleConfirm = async () => {
    if (pendingChange === null) {
      return;
    }

    try {
      await updateServerAdminAccess({
        variables: {
          userId,
          otp: otp.length > 0 ? otp : undefined,
          ...(pendingChange.field === 'canAccessFullAdminPanel'
            ? { canAccessFullAdminPanel: pendingChange.nextValue }
            : { canImpersonate: pendingChange.nextValue }),
        },
      });
      await refetch();
      enqueueSuccessSnackBar({
        message: t`Server administrator access updated.`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Failed to update server administrator access.`,
      });
    } finally {
      setOtp('');
      setPendingChange(null);
    }
  };

  const fieldLabel =
    pendingChange?.field === 'canImpersonate'
      ? t`impersonation`
      : t`full admin panel access`;
  const isRevoking = pendingChange?.nextValue === false;

  return (
    <Section>
      <H2Title
        title={t`Administrator access`}
        description={t`Server-level access for this user. Changes take effect immediately, require your two-factor code, and notify all administrators.`}
      />
      {loading ? (
        <SettingsSectionSkeletonLoader />
      ) : (
        <Card rounded fullWidth>
          <SettingsOptionCardContentToggle
            title={t`Full admin panel access`}
            description={t`Access the server admin panel — configuration, feature flags, health, and every workspace.`}
            checked={canAccessFullAdminPanel}
            disabled={isLastFullAdmin}
            divider
            onChange={(nextValue) =>
              requestChange('canAccessFullAdminPanel', nextValue)
            }
          />
          <SettingsOptionCardContentToggle
            title={t`Impersonation`}
            description={t`Sign in as any user across workspaces.`}
            checked={canImpersonate}
            onChange={(nextValue) => requestChange('canImpersonate', nextValue)}
          />
        </Card>
      )}
      <ConfirmationModal
        modalInstanceId={SERVER_ADMIN_ACCESS_CONFIRMATION_MODAL_ID}
        title={isRevoking ? t`Revoke access` : t`Grant access`}
        confirmButtonAccent={isRevoking ? 'danger' : 'blue'}
        confirmButtonText={t`Confirm`}
        onConfirmClick={handleConfirm}
        onClose={() => {
          setOtp('');
          setPendingChange(null);
        }}
        subtitle={
          <StyledConfirmationContent>
            <div>
              {isRevoking
                ? t`This will revoke ${fieldLabel} for ${userLabel}.`
                : t`This will grant ${fieldLabel} to ${userLabel}.`}
            </div>
            <div>{t`Enter your two-factor authentication code to confirm.`}</div>
            <OTPInput
              maxLength={6}
              value={otp}
              onChange={setOtp}
              render={({ slots }) => (
                <StyledOTPContainer>
                  {slots.slice(0, 3).map((slot, index) => (
                    <TwoFactorAuthenticationVerificationCodeSlot
                      key={index}
                      char={slot.char}
                      placeholderChar={slot.placeholderChar}
                      isActive={slot.isActive}
                      hasFakeCaret={slot.hasFakeCaret}
                    />
                  ))}
                  <TwoFactorAuthenticationVerificationCodeDash />
                  {slots.slice(3).map((slot, index) => (
                    <TwoFactorAuthenticationVerificationCodeSlot
                      key={index + 3}
                      char={slot.char}
                      placeholderChar={slot.placeholderChar}
                      isActive={slot.isActive}
                      hasFakeCaret={slot.hasFakeCaret}
                    />
                  ))}
                </StyledOTPContainer>
              )}
            />
          </StyledConfirmationContent>
        }
      />
    </Section>
  );
};
