import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type CampaignAudiencePreview } from '@/activities/emails/types/CampaignAudiencePreview';
import { buildExcludedRecipientReasons } from '@/activities/emails/utils/buildExcludedRecipientReasons';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledCount = styled.span<{ $isMuted: boolean }>`
  color: ${({ $isMuted }) =>
    $isMuted
      ? themeCssVariables.font.color.light
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
`;

const ANCHOR_ID = 'campaign-composer-recipient-count';

type CampaignRecipientCountProps = {
  audiencePreview: CampaignAudiencePreview | null;
  hasFailed: boolean;
};

export const CampaignRecipientCount = ({
  audiencePreview,
  hasFailed,
}: CampaignRecipientCountProps) => {
  if (hasFailed) {
    return <StyledCount $isMuted={true}>{t`Count unavailable`}</StyledCount>;
  }

  if (!isDefined(audiencePreview)) {
    return null;
  }

  const { sendable, totalMembers } = audiencePreview;
  const excludedReasons = buildExcludedRecipientReasons(audiencePreview);
  const hasExcludedRecipients = excludedReasons.length > 0;

  const label = hasExcludedRecipients
    ? plural(sendable, {
        one: `${formatNumber(sendable)} of ${formatNumber(totalMembers)} recipient`,
        other: `${formatNumber(sendable)} of ${formatNumber(totalMembers)} recipients`,
      })
    : plural(totalMembers, {
        one: `${formatNumber(totalMembers)} recipient`,
        other: `${formatNumber(totalMembers)} recipients`,
      });

  return (
    <>
      <StyledCount id={ANCHOR_ID} $isMuted={false}>
        {label}
      </StyledCount>
      {hasExcludedRecipients && (
        <AppTooltip
          anchorSelect={`#${ANCHOR_ID}`}
          content={t`Skipped: ${excludedReasons.join(', ')}`}
          delay={TooltipDelay.shortDelay}
          noArrow
          place="bottom"
          positionStrategy="fixed"
        />
      )}
    </>
  );
};
