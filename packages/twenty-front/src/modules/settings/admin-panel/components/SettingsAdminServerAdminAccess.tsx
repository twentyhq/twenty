import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { TwoFactorAuthenticationVerificationCodeDash } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeDash';
import { TwoFactorAuthenticationVerificationCodeSlot } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeSlot';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { OTPInput } from 'input-otp';
import { useState } from 'react';
import { Chip } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  GetServerAdminsDocument,
  UpdateServerAdminAccessDocument,
} from '~/generated-admin/graphql';

type ServerAdminAccessUpdate = {
  canAccessFullAdminPanel?: boolean;
  canImpersonate?: boolean;
};

type PendingServerAdminChange = {
  description: string;
  isRevoking: boolean;
  update: ServerAdminAccessUpdate;
};

const SERVER_ADMIN_ACCESS_CONFIRMATION_MODAL_ID =
  'server-admin-access-confirmation';

const StyledValue = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledChips = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledNoAccess = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
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

export const SettingsAdminServerAdminAccess = ({
  userId,
  userLabel,
}: {
  userId: string;
  userLabel: string;
}) => {
  const dropdownId = `server-admin-access-${userId}`;
  const apolloAdminClient = useApolloAdminClient();
  const { openModal } = useModal();
  const { closeDropdown } = useCloseDropdown();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [pendingChange, setPendingChange] =
    useState<PendingServerAdminChange | null>(null);
  const [otp, setOtp] = useState('');

  const { data, refetch } = useQuery(GetServerAdminsDocument, {
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
  const hasAnyAccess = canAccessFullAdminPanel || canImpersonate;
  const hasFullAccess = canAccessFullAdminPanel && canImpersonate;

  const requestChange = (change: PendingServerAdminChange) => {
    closeDropdown(dropdownId);
    setOtp('');
    setPendingChange(change);
    openModal(SERVER_ADMIN_ACCESS_CONFIRMATION_MODAL_ID);
  };

  const handleConfirm = async () => {
    if (pendingChange === null) {
      return;
    }

    try {
      // Both flags can be sent in one mutation, so granting full access is a
      // single change and a single notification email.
      await updateServerAdminAccess({
        variables: {
          userId,
          otp: otp.length > 0 ? otp : undefined,
          ...pendingChange.update,
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

  return (
    <>
      <StyledValue>
        {hasAnyAccess ? (
          <StyledChips>
            {canAccessFullAdminPanel && <Chip label={t`Admin panel`} />}
            {canImpersonate && <Chip label={t`Impersonation`} />}
          </StyledChips>
        ) : (
          <StyledNoAccess>{t`No access`}</StyledNoAccess>
        )}
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="right-start"
          clickableComponent={
            <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
          }
          dropdownComponents={
            <DropdownContent>
              <DropdownMenuItemsContainer>
                <MenuItem
                  text={
                    canAccessFullAdminPanel
                      ? t`Revoke admin panel access`
                      : t`Grant admin panel access`
                  }
                  disabled={isLastFullAdmin}
                  onClick={() =>
                    requestChange({
                      description: t`full admin panel access`,
                      isRevoking: canAccessFullAdminPanel,
                      update: {
                        canAccessFullAdminPanel: !canAccessFullAdminPanel,
                      },
                    })
                  }
                />
                <MenuItem
                  text={
                    canImpersonate
                      ? t`Disable impersonation`
                      : t`Enable impersonation`
                  }
                  onClick={() =>
                    requestChange({
                      description: t`impersonation`,
                      isRevoking: canImpersonate,
                      update: { canImpersonate: !canImpersonate },
                    })
                  }
                />
                {!hasFullAccess && (
                  <MenuItem
                    text={t`Grant full access`}
                    onClick={() =>
                      requestChange({
                        description: t`full server access`,
                        isRevoking: false,
                        update: {
                          canAccessFullAdminPanel: true,
                          canImpersonate: true,
                        },
                      })
                    }
                  />
                )}
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      </StyledValue>
      <ConfirmationModal
        modalInstanceId={SERVER_ADMIN_ACCESS_CONFIRMATION_MODAL_ID}
        title={pendingChange?.isRevoking ? t`Revoke access` : t`Grant access`}
        confirmButtonAccent={pendingChange?.isRevoking ? 'danger' : 'blue'}
        confirmButtonText={t`Confirm`}
        onConfirmClick={handleConfirm}
        onClose={() => {
          setOtp('');
          setPendingChange(null);
        }}
        subtitle={
          <StyledConfirmationContent>
            <div>
              {pendingChange?.isRevoking
                ? t`This will revoke ${pendingChange?.description ?? ''} for ${userLabel}.`
                : t`This will grant ${pendingChange?.description ?? ''} to ${userLabel}.`}
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
    </>
  );
};
