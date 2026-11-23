import { AppConnectionHeader } from '@/applications/components/AppConnectionHeader';
import { AuthorizeActionButtons } from '@/applications/components/AuthorizeActionButtons';
import { useFormatApplicationPriceAmount } from '@/settings/applications/hooks/useFormatApplicationPriceAmount';
import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { getConnectionBillingValidationModalInstanceId } from '@/settings/applications/utils/getConnectionBillingValidationModalInstanceId';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconChevronLeft, IconCreditCard } from 'twenty-ui/icon';
import { LightButton } from 'twenty-ui/components/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { type ApplicationBillingPrice } from '~/generated-metadata/graphql';

type SettingsApplicationConnectionBillingValidationModalProps = {
  applicationId: string;
  connectionProviderName: string;
  connectionProviderType: string;
  connectionProviderDisplayName: string;
  connectionProviderLogoUrl?: string | null;
  connectedAccountPrices: ApplicationBillingPrice[];
  redirectLocation?: string;
};

const StyledFullscreenContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[16]} ${themeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

const StyledBackButtonContainer = styled.div`
  left: ${themeCssVariables.spacing[4]};
  position: fixed;
  top: ${themeCssVariables.spacing[4]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin: auto 0;
  max-width: 400px;
  width: 100%;
`;

const StyledAppConnectionHeaderContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

const StyledPricesCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledPricesTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledPriceRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledPriceIcon = styled.div`
  color: ${themeCssVariables.color.blue9};
  display: flex;
`;

export const SettingsApplicationConnectionBillingValidationModal = ({
  applicationId,
  connectionProviderName,
  connectionProviderType,
  connectionProviderDisplayName,
  connectionProviderLogoUrl,
  connectedAccountPrices,
  redirectLocation,
}: SettingsApplicationConnectionBillingValidationModalProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const { startAppConnection } = useStartAppConnection();
  const { formatApplicationPriceAmount } = useFormatApplicationPriceAmount();

  const modalInstanceId = getConnectionBillingValidationModalInstanceId({
    applicationId,
    connectionProviderName,
  });

  const formatPrice = (price: ApplicationBillingPrice) => {
    const amount = formatApplicationPriceAmount(price);

    return price.billingPeriod === 'MONTHLY' ? t`${amount} / month` : amount;
  };

  const handleClose = () => {
    closeDialog(modalInstanceId);
  };

  const handleAuthorize = () => {
    closeDialog(modalInstanceId);
    startAppConnection({
      applicationId,
      connectionProviderName,
      connectionProviderType,
      redirectLocation,
    });
  };

  return (
    <DialogInstance
      dialogId={modalInstanceId}
      dismissible
      onClose={handleClose}
      renderInDocumentBody
    >
      {({ onKeyDown }) => (
        <Dialog.Popup
          aria-label={t`Connect a ${connectionProviderDisplayName} account`}
          onKeyDown={onKeyDown}
          size="fullscreen"
        >
          <StyledFullscreenContainer>
            <StyledBackButtonContainer>
              <LightButton
                startIcon={<IconChevronLeft />}
                onClick={handleClose}
              >{t`Back to settings`}</LightButton>
            </StyledBackButtonContainer>

            <StyledContent>
              <StyledAppConnectionHeaderContainer>
                <AppConnectionHeader
                  appLogoUrl={connectionProviderLogoUrl}
                  appName={connectionProviderDisplayName}
                />
              </StyledAppConnectionHeaderContainer>

              <StyledTitle>
                {t`Connect a ${connectionProviderDisplayName} account`}
              </StyledTitle>

              <StyledPricesCard>
                <StyledPricesTitle>
                  {t`This connection is added to your workspace subscription:`}
                </StyledPricesTitle>
                {connectedAccountPrices.map((price) => {
                  const formattedPrice = formatPrice(price);

                  return (
                    <StyledPriceRow key={price.universalIdentifier}>
                      <StyledPriceIcon>
                        <IconCreditCard size={16} aria-hidden />
                      </StyledPriceIcon>
                      {t`${price.label}: ${formattedPrice}`}
                    </StyledPriceRow>
                  );
                })}
              </StyledPricesCard>

              <AuthorizeActionButtons
                onCancel={handleClose}
                onAuthorize={handleAuthorize}
              />
            </StyledContent>
          </StyledFullscreenContainer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
