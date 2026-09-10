import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconSend } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

import { useSendMessageCampaignTest } from '@/activities/emails/hooks/useSendMessageCampaignTest';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { sendCampaignTestCampaignIdComponentState } from '@/side-panel/pages/send-campaign-test/states/sendCampaignTestCampaignIdComponentState';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

export const SidePanelSendCampaignTestPage = () => {
  const sendCampaignTestCampaignId = useAtomComponentStateValue(
    sendCampaignTestCampaignIdComponentState,
  );

  const { goBackFromSidePanel } = useSidePanelHistory();
  const { sendMessageCampaignTest, loading } = useSendMessageCampaignTest();

  const [toAddress, setToAddress] = useState('');

  const { record: campaign } = useFindOneRecord<MessageCampaign>({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
    objectRecordId: sendCampaignTestCampaignId ?? '',
    skip: !isDefined(sendCampaignTestCampaignId),
  });

  const canSend =
    isValidEmailRecipientAddress(toAddress) &&
    isDefined(campaign) &&
    isNonEmptyString(campaign.fromAddress?.primaryEmail) &&
    isNonEmptyString(campaign.subject) &&
    isNonEmptyString(campaign.bodyTemplate);

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    const sent = await sendMessageCampaignTest({
      toAddress,
      subject: campaign.subject ?? '',
      body: campaign.bodyTemplate ?? '',
      fromAddress: campaign.fromAddress?.primaryEmail ?? '',
      unsubscribeTopicId: campaign.unsubscribeTopicId ?? undefined,
    });

    if (sent) {
      goBackFromSidePanel();
    }
  };

  return (
    <StyledContainer>
      <StyledContent>
        <FormTextFieldInput
          label={t`Recipient`}
          placeholder={t`recipient@example.com`}
          defaultValue={toAddress}
          onChange={setToAddress}
        />
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="send-test"
            title={t`Send test email`}
            Icon={IconSend}
            variant="primary"
            accent="blue"
            size="small"
            disabled={!canSend || loading}
            onClick={handleSend}
          />,
        ]}
      />
    </StyledContainer>
  );
};
