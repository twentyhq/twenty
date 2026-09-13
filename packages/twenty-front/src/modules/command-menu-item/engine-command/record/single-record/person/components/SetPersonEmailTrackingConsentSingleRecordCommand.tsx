import { isDefined } from 'twenty-shared/utils';

import { useSetPersonEmailTrackingConsent } from '@/activities/emails/hooks/useSetPersonEmailTrackingConsent';
import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { t } from '@lingui/core/macro';
import { MessageTrackingConsentDecision } from '~/generated-metadata/graphql';

export const SetPersonEmailTrackingConsentSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];
  const personId = selectedRecord?.id;
  const { setPersonEmailTrackingConsent } = useSetPersonEmailTrackingConsent();

  if (!isDefined(personId)) {
    throw new Error('Record ID is required to set email tracking');
  }

  const isTrackingRefused =
    selectedRecord.emailTrackingConsent ===
    MessageTrackingConsentDecision.DENIED;

  const decision = isTrackingRefused
    ? MessageTrackingConsentDecision.GRANTED
    : MessageTrackingConsentDecision.DENIED;

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={isTrackingRefused ? t`Measure again` : t`Stop measuring`}
      subtitle={
        isTrackingRefused
          ? t`Opens and clicks on campaign emails sent to this person's addresses will be measured again.`
          : t`Opens and clicks on campaign emails sent to this person's addresses will no longer be measured. Past data is kept.`
      }
      confirmButtonText={
        isTrackingRefused ? t`Measure again` : t`Stop measuring`
      }
      confirmButtonAccent={isTrackingRefused ? 'blue' : 'danger'}
      execute={() => setPersonEmailTrackingConsent({ personId, decision })}
    />
  );
};
