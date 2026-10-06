import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { AnimatedFormattedNumber } from '@/settings/billing/components/internal/AnimatedFormattedNumber';
import { usePurchaseCreditTopUp } from '@/settings/billing/hooks/usePurchaseCreditTopUp';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconCoins, IconCreditCard, IconRefreshDot } from 'twenty-ui/icon';
import { Button, Slider } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { v4 } from 'uuid';
import {
  BillingInvoicePaymentStatus,
  GetCreditTopUpOffersDocument,
} from '~/generated-metadata/graphql';

const StyledCenteredTitle = styled.div`
  text-align: center;

  h2 {
    margin-bottom: ${themeCssVariables.spacing[6]};
  }
`;

const StyledSectionContainer = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledOfferCard = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: 11px;
`;

const StyledOfferHeaderRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[4]};
`;

const StyledOfferCreditAmount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  white-space: nowrap;
`;

const StyledOfferPrice = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1 1 auto;
  font-size: ${themeCssVariables.font.size.md};
  text-align: right;
  white-space: nowrap;
`;

const StyledOfferDivider = styled.div`
  background-color: ${themeCssVariables.border.color.medium};
  height: 1px;
  width: 100%;
`;

const StyledOfferSummaryRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${themeCssVariables.spacing[6]};
`;

const StyledModalActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[6]};
`;

const StyledActionSlot = styled.div`
  flex: 1;
`;

type CreditTopUpModalContentProps = {
  dialogId: string;
} & ReturnType<typeof usePurchaseCreditTopUp>;

const CreditTopUpModalContent = ({
  dialogId,
  purchaseCreditTopUp,
  completePaymentAndWaitForCredits,
  isPurchasing,
}: CreditTopUpModalContentProps) => {
  const theme = useTheme();
  const { closeDialog } = useDialog();
  const { formatNumber } = useNumberFormat();

  const { data, loading: isLoadingOffers } = useQuery(
    GetCreditTopUpOffersDocument,
    { fetchPolicy: 'network-only' },
  );

  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [idempotencyKey, setIdempotencyKey] = useState(() => v4());
  const [hostedInvoiceUrl, setHostedInvoiceUrl] = useState<string | null>(null);

  const offers = data?.getCreditTopUpOffers ?? [];
  const selectedOffer = offers[Math.min(selectedOfferIndex, offers.length - 1)];
  const formatPrice = (amountCents: number) =>
    formatNumber(amountCents / 100, { decimals: 2 });

  const handleOfferChange = (offerIndex: number) => {
    setSelectedOfferIndex(offerIndex);
    setIdempotencyKey(v4());
  };

  const handleConfirm = async () => {
    if (!isDefined(selectedOffer)) {
      return;
    }

    const { creditTopUp, isRefusedBeforeCharge } = await purchaseCreditTopUp({
      creditAmount: selectedOffer.creditAmount,
      idempotencyKey,
    });

    if (isRefusedBeforeCharge) {
      setIdempotencyKey(v4());
    }

    if (
      isDefined(creditTopUp) &&
      creditTopUp.status === BillingInvoicePaymentStatus.REQUIRES_ACTION &&
      isDefined(creditTopUp.hostedInvoiceUrl)
    ) {
      setHostedInvoiceUrl(creditTopUp.hostedInvoiceUrl);
    }
  };

  if (isDefined(hostedInvoiceUrl)) {
    return (
      <>
        <StyledCenteredTitle>
          <Dialog.Title>{t`Confirm your payment`}</Dialog.Title>
        </StyledCenteredTitle>
        <StyledSectionContainer>
          <Section.Root align="center" color="primary">
            {t`Your bank needs to confirm this payment. Finish it on the secure Stripe page; the credits are added as soon as it succeeds.`}
          </Section.Root>
        </StyledSectionContainer>
        <StyledModalActions>
          <StyledActionSlot>
            <Button
              onClick={() => closeDialog(dialogId)}
              fullWidth
              variant="outline"
            >{t`Later`}</Button>
          </StyledActionSlot>
          <StyledActionSlot>
            <Button
              onClick={() => completePaymentAndWaitForCredits(hostedInvoiceUrl)}
              fullWidth
              variant="solid"
              color="accent"
            >{t`Continue to payment`}</Button>
          </StyledActionSlot>
        </StyledModalActions>
      </>
    );
  }

  return (
    <>
      <StyledCenteredTitle>
        <Dialog.Title>{t`Buy credits`}</Dialog.Title>
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section.Root align="center" color="primary">
          {isLoadingOffers || offers.length > 0
            ? t`A one-time purchase, charged now to your saved card.`
            : t`Credits can only be bought on an active subscription with a payment method.`}
        </Section.Root>
      </StyledSectionContainer>
      {isDefined(selectedOffer) && (
        <StyledOfferCard>
          <StyledOfferHeaderRow>
            <IconCoins
              size={theme.icon.size.md}
              color={themeCssVariables.color.green9}
            />
            <StyledOfferCreditAmount>
              <AnimatedFormattedNumber
                value={selectedOffer.creditAmount}
                formatValue={(value) => formatNumber(value)}
              />{' '}
              {t`credits`}
            </StyledOfferCreditAmount>
            <StyledOfferPrice>
              $
              <AnimatedFormattedNumber
                value={selectedOffer.amountCents}
                formatValue={formatPrice}
              />
            </StyledOfferPrice>
          </StyledOfferHeaderRow>
          <Slider.Root
            min={0}
            max={Math.max(1, offers.length - 1)}
            step={1}
            value={selectedOfferIndex}
            onValueChange={handleOfferChange}
            disabled={isPurchasing || offers.length < 2}
            color="success"
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Indicator />
                <Slider.Thumb aria-label={t`Credit amount`} />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
          <StyledOfferDivider />
          <div>
            <StyledOfferSummaryRow>
              <IconCreditCard
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
              {t`Tax added where it applies`}
            </StyledOfferSummaryRow>
            <StyledOfferSummaryRow>
              <IconRefreshDot
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
              {t`Used after your plan's credits, kept while you are subscribed`}
            </StyledOfferSummaryRow>
          </div>
        </StyledOfferCard>
      )}
      <StyledModalActions>
        <StyledActionSlot>
          <Button
            onClick={() => closeDialog(dialogId)}
            fullWidth
            disabled={isPurchasing}
            variant="outline"
          >{t`Cancel`}</Button>
        </StyledActionSlot>
        <StyledActionSlot>
          <Button
            onClick={handleConfirm}
            fullWidth
            disabled={!isDefined(selectedOffer) || isPurchasing}
            variant="solid"
            color="accent"
          >{t`Buy credits`}</Button>
        </StyledActionSlot>
      </StyledModalActions>
    </>
  );
};

export const CreditTopUpModal = ({ dialogId }: { dialogId: string }) => {
  const {
    purchaseCreditTopUp,
    completePaymentAndWaitForCredits,
    isPurchasing,
  } = usePurchaseCreditTopUp({ dialogId });

  // Not dismissible mid-payment: a 3DS answer arriving after the close would be lost
  return (
    <DialogInstance
      dialogId={dialogId}
      dismissible={!isPurchasing}
      renderInDocumentBody
    >
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="md"
          data-globally-prevent-click-outside
          style={{
            padding: 'var(--t-spacing-6)',
            borderRadius: 'var(--t-spacing-1)',
            width: '360px',
          }}
        >
          <CreditTopUpModalContent
            dialogId={dialogId}
            purchaseCreditTopUp={purchaseCreditTopUp}
            completePaymentAndWaitForCredits={completePaymentAndWaitForCredits}
            isPurchasing={isPurchasing}
          />
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
