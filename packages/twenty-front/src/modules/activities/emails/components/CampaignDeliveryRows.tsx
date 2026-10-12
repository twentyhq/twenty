import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type SelectOption } from 'twenty-ui/primitives/input';

import { CampaignEnvelopeRow } from '@/activities/emails/components/CampaignEnvelopeBox';
import { campaignDeliveryFamilyState } from '@/activities/emails/states/campaignDeliveryFamilyState';
import { type CampaignDeliveryTiming } from '@/activities/emails/types/CampaignDeliveryTiming';
import { buildDefaultCampaignScheduledAt } from '@/activities/emails/utils/buildDefaultCampaignScheduledAt';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { Select } from '@/ui/input/components/Select';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { IconClock, IconSend } from 'twenty-ui/icon';

type CampaignDeliveryRowsProps = {
  campaignId: string;
};

export const CampaignDeliveryRows = ({
  campaignId,
}: CampaignDeliveryRowsProps) => {
  const [campaignDelivery, setCampaignDelivery] = useAtomFamilyState(
    campaignDeliveryFamilyState,
    campaignId,
  );
  const { openDropdown } = useOpenDropdown();
  const deliveryTimingDropdownId = `campaign-composer-delivery-timing-${campaignId}`;

  const deliveryTimingOptions: SelectOption<CampaignDeliveryTiming>[] = [
    { label: t`Send now`, value: 'NOW' },
    { label: t`Send later`, value: 'LATER' },
  ];

  const handleDeliveryTimingChange = (timing: CampaignDeliveryTiming) =>
    setCampaignDelivery((previousCampaignDelivery) => ({
      timing,
      scheduledAt:
        timing === 'LATER' &&
        !isNonEmptyString(previousCampaignDelivery.scheduledAt)
          ? buildDefaultCampaignScheduledAt().toISOString()
          : previousCampaignDelivery.scheduledAt,
    }));

  const handleScheduledAtChange = (scheduledAt: string | null) =>
    setCampaignDelivery((previousCampaignDelivery) => ({
      ...previousCampaignDelivery,
      scheduledAt,
    }));

  return (
    <>
      <CampaignEnvelopeRow
        label={t`Delivery`}
        Icon={IconSend}
        onClick={() =>
          openDropdown({
            dropdownComponentInstanceIdFromProps: deliveryTimingDropdownId,
          })
        }
      >
        <Select
          dropdownId={deliveryTimingDropdownId}
          fullWidth
          variant="transparent"
          value={campaignDelivery.timing}
          options={deliveryTimingOptions}
          onChange={handleDeliveryTimingChange}
        />
      </CampaignEnvelopeRow>
      {campaignDelivery.timing === 'LATER' && (
        <CampaignEnvelopeRow
          label={t`Send at`}
          Icon={IconClock}
          onClick={(event) =>
            event.currentTarget.querySelector('input')?.focus()
          }
        >
          <FormDateTimeFieldInput
            variant="transparent"
            defaultValue={campaignDelivery.scheduledAt ?? undefined}
            onChange={handleScheduledAtChange}
          />
        </CampaignEnvelopeRow>
      )}
    </>
  );
};
