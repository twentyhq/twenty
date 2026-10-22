import { plural, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconSend } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { useCampaignSendPreview } from '@/activities/emails/hooks/useCampaignSendPreview';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
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

  const { sendPreview } = useCampaignSendPreview({
    campaignId: sendCampaignCampaignId,
    scheduledAt: null,
  });

  const audiencePreview = sendPreview?.audience ?? null;

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
