import { styled } from '@linaria/react';
import { useState } from 'react';

import { type useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { useSendMessageCampaignTest } from '@/activities/emails/hooks/useSendMessageCampaignTest';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { t } from '@lingui/core/macro';
import { IconTestPipe } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

const CAMPAIGN_TEST_SEND_MODAL_ID = 'campaign-test-send-modal';

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledButtonRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[6]};
`;

type CampaignTestSendSectionProps = {
  campaignState: ReturnType<typeof useCampaignComposerState>;
};

export const CampaignTestSendSection = ({
  campaignState,
}: CampaignTestSendSectionProps) => {
  const [toAddress, setToAddress] = useState('');

  const { openModal, closeModal } = useModal();

  const { enqueueErrorSnackBar } = useSnackBar();

  const { sendMessageCampaignTest, loading } = useSendMessageCampaignTest();

  const canSendTest =
    isValidEmailRecipientAddress(toAddress.trim()) && !loading;

  const handleSendTest = async () => {
    if (!canSendTest) {
      return;
    }

    if (campaignState.fromAddress.trim().length === 0) {
      enqueueErrorSnackBar({ message: t`Select a sender first` });

      return;
    }

    if (campaignState.subject.trim().length === 0) {
      enqueueErrorSnackBar({ message: t`Add a subject first` });

      return;
    }

    const success = await sendMessageCampaignTest({
      toAddress: toAddress.trim(),
      unsubscribeTopicId: campaignState.unsubscribeTopicId ?? undefined,
      subject: campaignState.subject,
      body: campaignState.body,
      fromAddress: campaignState.fromAddress.trim(),
    });

    if (success) {
      closeModal(CAMPAIGN_TEST_SEND_MODAL_ID);
      setToAddress('');
    }
  };

  return (
    <>
      <Button
        size="small"
        variant="secondary"
        title={t`Send test email`}
        Icon={IconTestPipe}
        onClick={() => openModal(CAMPAIGN_TEST_SEND_MODAL_ID)}
      />
      <ModalStatefulWrapper
        modalInstanceId={CAMPAIGN_TEST_SEND_MODAL_ID}
        onEnter={handleSendTest}
        isClosable={true}
        padding="large"
        dataGloballyPreventClickOutside
        renderInDocumentBody
        smallBorderRadius
        narrowWidth
        autoHeight
      >
        <StyledCenteredTitle>
          <H1Title
            title={t`Send test email`}
            fontColor={H1TitleFontColor.Primary}
          />
        </StyledCenteredTitle>
        <StyledSectionContainer>
          <Section
            alignment={SectionAlignment.Center}
            fontColor={SectionFontColor.Primary}
          >
            {t`Send this campaign to a single address to preview it.`}
          </Section>
        </StyledSectionContainer>
        <Section>
          <SettingsTextInput
            instanceId="campaign-test-send-to-address"
            value={toAddress}
            onChange={setToAddress}
            placeholder={t`Recipient email address`}
            fullWidth
            disableHotkeys
            autoFocusOnMount
          />
        </Section>
        <StyledButtonRow>
          <Button
            onClick={() => closeModal(CAMPAIGN_TEST_SEND_MODAL_ID)}
            variant="secondary"
            title={t`Cancel`}
            justify="center"
          />
          <Button
            onClick={handleSendTest}
            variant="primary"
            accent="blue"
            title={t`Send test`}
            Icon={IconTestPipe}
            disabled={!canSendTest}
            justify="center"
          />
        </StyledButtonRow>
      </ModalStatefulWrapper>
    </>
  );
};
