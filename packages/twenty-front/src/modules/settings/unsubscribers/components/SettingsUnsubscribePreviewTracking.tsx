import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { getUnsubscribePageTrackingCopy } from '@/settings/unsubscribers/utils/getUnsubscribePageTrackingCopy';
import { Section } from 'twenty-ui/components/layout';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTrackingOptions = styled.div`
  padding-top: ${themeCssVariables.spacing[1]};
`;

type SettingsUnsubscribePreviewTrackingProps = {
  senderName: string;
  isOpenTrackingEnabled: boolean;
  isClickTrackingEnabled: boolean;
};

export const SettingsUnsubscribePreviewTracking = ({
  senderName,
  isOpenTrackingEnabled,
  isClickTrackingEnabled,
}: SettingsUnsubscribePreviewTrackingProps) => {
  const { t } = useLingui();

  const { description, keepLabel } = getUnsubscribePageTrackingCopy({
    senderName,
    isOpenTrackingEnabled,
    isClickTrackingEnabled,
  });

  return (
    <div>
      <Section.Header
        level={4}
        title={t`Email tracking`}
        description={description}
      />
      <StyledTrackingOptions>
        <RadioGroup defaultValue="TRACKED" aria-label={t`Email tracking`}>
          <Radio value="TRACKED">{keepLabel}</Radio>
          <Radio value="OPTED_OUT">{t`Opt out of tracking`}</Radio>
        </RadioGroup>
      </StyledTrackingOptions>
    </div>
  );
};
