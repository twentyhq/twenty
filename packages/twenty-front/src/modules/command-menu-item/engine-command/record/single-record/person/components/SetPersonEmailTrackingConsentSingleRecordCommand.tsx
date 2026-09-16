import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useSetPersonEmailTrackingConsent } from '@/activities/emails/hooks/useSetPersonEmailTrackingConsent';
import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
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

  const {
    record: person,
    loading,
    refetch,
  } = useFindOneRecord<
    ObjectRecord & {
      emailTrackingConsent: MessageTrackingConsentDecision | null;
    }
  >({
    objectNameSingular: CoreObjectNameSingular.Person,
    objectRecordId: personId,
    recordGqlFields: { emailTrackingConsent: true },
  });

  if (loading || !isDefined(person)) {
    return null;
  }

  const isOptedOut =
    person.emailTrackingConsent === MessageTrackingConsentDecision.DENIED;

  const decision = isOptedOut
    ? MessageTrackingConsentDecision.GRANTED
    : MessageTrackingConsentDecision.DENIED;

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={
        isOptedOut
          ? t`Opt this person back in to email tracking`
          : t`Opt this person out of email tracking`
      }
      subtitle={
        isOptedOut
          ? t`Starting with the next campaign, link clicks on emails sent to this person will be recorded again.`
          : t`This person keeps receiving campaign emails. Starting with the next campaign, link clicks on their emails will not be recorded. Clicks already recorded are kept.`
      }
      confirmButtonText={isOptedOut ? t`Opt in` : t`Opt out`}
      confirmButtonColor={isOptedOut ? 'accent' : 'danger'}
      execute={async () => {
        if (await setPersonEmailTrackingConsent({ personId, decision })) {
          await refetch();
        }
      }}
    />
  );
};
