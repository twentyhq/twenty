import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconSend } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { useCampaignAudiencePreview } from '@/activities/emails/hooks/useCampaignAudiencePreview';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { sendCampaignCampaignIdComponentState } from '@/side-panel/pages/send-campaign/states/sendCampaignCampaignIdComponentState';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type SidePanelSendCampaignInfoProps = {
  sidePanelPageInstanceId: string;
};

export const SidePanelSendCampaignInfo = ({
  sidePanelPageInstanceId,
}: SidePanelSendCampaignInfoProps) => {
  const theme = useTheme();
  const { formatNumber } = useNumberFormat();

  const sendCampaignCampaignId = useAtomComponentStateValue(
    sendCampaignCampaignIdComponentState,
    sidePanelPageInstanceId,
  );

  const { record: campaign } = useFindOneRecord<MessageCampaign>({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
    objectRecordId: sendCampaignCampaignId,
    skip: !isNonEmptyString(sendCampaignCampaignId),
  });

  const { audiencePreview } = useCampaignAudiencePreview({
    listId: campaign?.listId ?? null,
    unsubscribeTopicId: campaign?.unsubscribeTopicId ?? null,
  });

  return (
    <HeaderIdentifier
      icon={
        <IconSend size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      }
      iconColor={theme.font.color.tertiary}
      title={t`Send Campaign`}
      label={
        isDefined(audiencePreview)
          ? plural(audiencePreview.sendable, {
              one: `${formatNumber(audiencePreview.sendable)} recipient`,
              other: `${formatNumber(audiencePreview.sendable)} recipients`,
            })
          : undefined
      }
    />
  );
};
