import { styled } from '@linaria/react';
import { useState } from 'react';

import { type useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { useSendMessageCampaignTest } from '@/activities/emails/hooks/useSendMessageCampaignTest';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { t } from '@lingui/core/macro';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { IconTestPipe } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledInputRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInputContainer = styled.div`
  flex: 1;
`;

type CampaignTestSendSectionProps = {
  campaignState: ReturnType<typeof useCampaignComposerState>;
};

export const CampaignTestSendSection = ({
  campaignState,
}: CampaignTestSendSectionProps) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [toAddress, setToAddress] = useState('');

  const { sendMessageCampaignTest, loading } = useSendMessageCampaignTest();

  const canSendTest =
    isValidEmailRecipientAddress(toAddress.trim()) &&
    campaignState.fromAddress.trim().length > 0 &&
    campaignState.subject.trim().length > 0 &&
    !loading;

  const handleSendTest = async () => {
    if (!canSendTest) {
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
      setIsInputVisible(false);
      setToAddress('');
    }
  };

  if (!isInputVisible) {
    return (
      <StyledContainer>
        <div>
          <Button
            size="small"
            variant="secondary"
            title={t`Send test email`}
            Icon={IconTestPipe}
            onClick={() => setIsInputVisible(true)}
          />
        </div>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledInputRow>
        <StyledInputContainer>
          <SettingsTextInput
            instanceId="campaign-test-send-to-address"
            value={toAddress}
            onChange={setToAddress}
            placeholder={t`Recipient email address`}
            autoFocusOnMount
            onInputEnter={handleSendTest}
          />
        </StyledInputContainer>
        <Button
          size="small"
          variant="secondary"
          title={t`Cancel`}
          onClick={() => {
            setIsInputVisible(false);
            setToAddress('');
          }}
        />
        <Button
          size="small"
          variant="primary"
          accent="blue"
          title={t`Send test`}
          Icon={IconTestPipe}
          onClick={handleSendTest}
          disabled={!canSendTest}
        />
      </StyledInputRow>
    </StyledContainer>
  );
};
