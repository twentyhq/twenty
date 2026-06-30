import { AppConnectionHeader } from '@/applications/components/AppConnectionHeader';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconAlertTriangle, IconChevronLeft } from 'twenty-ui/icon';
import { Button, Checkbox, LightButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type ApplicationUpgradePlan } from '@/marketplace/hooks/useUpgradeApplication';
import { StyledAppModal } from '~/pages/settings/applications/components/SettingsAppModalLayout';

type SettingsApplicationUpgradePlanModalProps = {
  modalInstanceId: string;
  appDisplayName: string;
  appLogoUrl?: string;
  plan: ApplicationUpgradePlan;
  onAuthorize: (allowDestructive: boolean) => void;
  isUpgrading?: boolean;
};

const StyledFullscreenContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: relative;
  width: 100%;
`;

const StyledLightButton = styled(LightButton)`
  left: ${themeCssVariables.spacing[4]};
  position: absolute;
  top: ${themeCssVariables.spacing[4]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  width: 100%;
`;

const StyledHeaderContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  margin-bottom: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSummaryRow = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledDestructiveCard = styled.div`
  background: ${themeCssVariables.background.transparent.danger};
  border: 1px solid ${themeCssVariables.border.color.danger};
  border-radius: ${themeCssVariables.border.radius.md};
  margin-bottom: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledDestructiveTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.danger};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledDestructiveRow = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledConfirmRow = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledButtons = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

export const SettingsApplicationUpgradePlanModal = ({
  modalInstanceId,
  appDisplayName,
  appLogoUrl,
  plan,
  onAuthorize,
  isUpgrading,
}: SettingsApplicationUpgradePlanModalProps) => {
  const { closeModal } = useModal();
  const [hasConfirmedDestructive, setHasConfirmedDestructive] = useState(false);

  const destructiveActions = plan.actions.filter(
    (action) => action.severity === 'destructive',
  );

  const handleClose = () => {
    closeModal(modalInstanceId);
  };

  const handleAuthorize = () => {
    closeModal(modalInstanceId);
    onAuthorize(plan.hasDestructiveActions);
  };

  const isAuthorizeDisabled =
    isUpgrading === true ||
    (plan.hasDestructiveActions && !hasConfirmedDestructive);

  return (
    <StyledAppModal
      modalId={modalInstanceId}
      isClosable
      onClose={handleClose}
      size="fullscreen"
      padding="none"
      overlay="transparent"
    >
      <StyledFullscreenContainer>
        <StyledLightButton
          Icon={IconChevronLeft}
          title={t`Back to settings`}
          onClick={handleClose}
        />

        <StyledContent>
          <StyledHeaderContainer>
            <AppConnectionHeader
              appLogoUrl={appLogoUrl}
              appName={appDisplayName}
            />
          </StyledHeaderContainer>

          <StyledTitle>
            {t`Upgrade ${appDisplayName} to ${plan.proposedVersion}`}
          </StyledTitle>

          <StyledCard>
            <StyledSummaryRow>
              {t`${plan.summary.createCount} to add`}
            </StyledSummaryRow>
            <StyledSummaryRow>
              {t`${plan.summary.updateCount} to change`}
            </StyledSummaryRow>
            <StyledSummaryRow>
              {t`${plan.summary.deleteCount} to remove`}
            </StyledSummaryRow>
          </StyledCard>

          {plan.hasDestructiveActions && (
            <StyledDestructiveCard>
              <StyledDestructiveTitle>
                <IconAlertTriangle size={16} />
                {t`This upgrade permanently deletes data`}
              </StyledDestructiveTitle>
              {destructiveActions.map((action) => (
                <StyledDestructiveRow key={action.metadataName}>
                  {action.label ?? action.metadataName}
                  {action.affectedRowCount !== null &&
                  action.affectedRowCount !== undefined
                    ? ` — ${action.affectedRowCount} value(s)`
                    : ''}
                </StyledDestructiveRow>
              ))}
              <StyledConfirmRow>
                <Checkbox
                  checked={hasConfirmedDestructive}
                  onCheckedChange={setHasConfirmedDestructive}
                />
                {t`I understand this cannot be undone`}
              </StyledConfirmRow>
            </StyledDestructiveCard>
          )}

          <StyledButtons>
            <LightButton title={t`Cancel`} onClick={handleClose} />
            <Button
              title={t`Upgrade`}
              variant="primary"
              accent="blue"
              onClick={handleAuthorize}
              disabled={isAuthorizeDisabled}
            />
          </StyledButtons>
        </StyledContent>
      </StyledFullscreenContainer>
    </StyledAppModal>
  );
};
