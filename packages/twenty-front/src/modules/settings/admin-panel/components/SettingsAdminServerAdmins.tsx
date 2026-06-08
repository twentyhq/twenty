import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { TwoFactorAuthenticationVerificationCodeDash } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeDash';
import { TwoFactorAuthenticationVerificationCodeSlot } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeSlot';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { OTPInput } from 'input-otp';
import { useState } from 'react';
import { H2Title, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  GetServerAdminsDocument,
  UpdateServerAdminAccessDocument,
} from '~/generated-admin/graphql';

const SERVER_ADMINS_GRID_TEMPLATE_COLUMNS = '2fr 1fr 1fr';
const SERVER_ADMIN_ACCESS_CONFIRMATION_MODAL_ID =
  'server-admin-access-confirmation';

type ServerAdminAccessField = 'canAccessFullAdminPanel' | 'canImpersonate';

type PendingServerAdminChange = {
  userId: string;
  userLabel: string;
  field: ServerAdminAccessField;
  nextValue: boolean;
};

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[4]} 0;
`;

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

export const SettingsAdminServerAdmins = () => {
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
  const fullAdminCount = serverAdmins.filter(
    (admin) => admin.canAccessFullAdminPanel,
  ).length;

  const requestChange = (change: PendingServerAdminChange) => {
    setOtp('');
    setPendingChange(change);
    openModal(SERVER_ADMIN_ACCESS_CONFIRMATION_MODAL_ID);
  };

  const handleConfirm = async () => {
    if (pendingChange === null) {
      return;
    }

    try {
      await updateServerAdminAccess({
        variables: {
          userId: pendingChange.userId,
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
        title={t`Administrators`}
        description={t`Grant or revoke server-level access. Changes take effect immediately and notify all administrators. The last administrator cannot be demoted.`}
      />
      {loading ? (
        <SettingsSectionSkeletonLoader />
      ) : serverAdmins.length === 0 ? (
        <StyledEmptyState>{t`No server administrators found.`}</StyledEmptyState>
      ) : (
        <Table>
          <TableBody>
            <TableRow gridTemplateColumns={SERVER_ADMINS_GRID_TEMPLATE_COLUMNS}>
              <TableHeader>{t`Administrator`}</TableHeader>
              <TableHeader>{t`Admin panel`}</TableHeader>
              <TableHeader>{t`Impersonation`}</TableHeader>
            </TableRow>
            {serverAdmins.map((admin) => {
              const adminLabel =
                `${admin.firstName || ''} ${admin.lastName || ''}`.trim() ||
                admin.email;
              const isLastFullAdmin =
                admin.canAccessFullAdminPanel && fullAdminCount <= 1;

              return (
                <TableRow
                  key={admin.id}
                  gridTemplateColumns={SERVER_ADMINS_GRID_TEMPLATE_COLUMNS}
                >
                  <TableCell
                    color={themeCssVariables.font.color.primary}
                    overflow="hidden"
                  >
                    <OverflowingTextWithTooltip text={adminLabel} />
                  </TableCell>
                  <TableCell>
                    <Toggle
                      value={admin.canAccessFullAdminPanel}
                      disabled={isLastFullAdmin}
                      onChange={(nextValue) =>
                        requestChange({
                          userId: admin.id,
                          userLabel: adminLabel,
                          field: 'canAccessFullAdminPanel',
                          nextValue,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Toggle
                      value={admin.canImpersonate}
                      onChange={(nextValue) =>
                        requestChange({
                          userId: admin.id,
                          userLabel: adminLabel,
                          field: 'canImpersonate',
                          nextValue,
                        })
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
                ? t`This will revoke ${fieldLabel} for ${pendingChange?.userLabel ?? ''}.`
                : t`This will grant ${fieldLabel} to ${pendingChange?.userLabel ?? ''}.`}
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
