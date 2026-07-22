import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { z } from 'zod';

import { type useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { useSendMessageCampaignTest } from '@/activities/emails/hooks/useSendMessageCampaignTest';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
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
  const [toAddressErrorMessage, setToAddressErrorMessage] = useState<
    string | undefined
  >();

  const { openModal, closeModal } = useModal();

  const { sendMessageCampaignTest, loading } = useSendMessageCampaignTest();

  const trimmedToAddress = toAddress.trim();

  const handleToAddressChange = (value: string) => {
    setToAddress(value);

    const trimmedValue = value.trim();

    setToAddressErrorMessage(
      z.email().safeParse(trimmedValue).success || trimmedValue.length === 0
        ? undefined
        : t`Invalid email address`,
    );
  };

  const isCampaignReadyForTest =
    isNonEmptyString(campaignState.fromAddress) &&
    isNonEmptyString(campaignState.subject.trim());

  const canSendTest =
    trimmedToAddress.length > 0 &&
    !isDefined(toAddressErrorMessage) &&
    isCampaignReadyForTest &&
    !loading;

  const handleSendTest = async () => {
    if (!canSendTest) {
      return;
    }

    const success = await sendMessageCampaignTest({
      toAddress: trimmedToAddress,
      unsubscribeTopicId: campaignState.unsubscribeTopicId ?? undefined,
      subject: campaignState.subject,
      body: campaignState.body,
      fromAddress: campaignState.fromAddress,
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
            onChange={handleToAddressChange}
            error={toAddressErrorMessage}
            placeholder={t`Recipient email address`}
            fullWidth
            disableHotkeys
            autoFocusOnMount
          />
        </Section>
        {!isCampaignReadyForTest && (
          <Section
            alignment={SectionAlignment.Center}
            fontColor={SectionFontColor.Tertiary}
          >
            {t`Add a sender and a subject to the campaign before sending a test.`}
          </Section>
        )}
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
