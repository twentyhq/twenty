import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { StandardObjectNameSingular } from 'twenty-shared/types';

type UseResolveDefaultEmailRecipientParams = {
  objectNameSingular: string | null | undefined;
  recordId: string | null | undefined;
};

export const useResolveDefaultEmailRecipient = ({
  objectNameSingular,
  recordId,
}: UseResolveDefaultEmailRecipientParams) => {
  const isPerson = objectNameSingular === StandardObjectNameSingular.Person;
  const isCompany = objectNameSingular === StandardObjectNameSingular.Company;
  const isOpportunity =
    objectNameSingular === StandardObjectNameSingular.Opportunity;

  const skipPerson = !isPerson || !recordId;
  const skipCompanyPeople = !isCompany || !recordId;
  const skipOpportunity = !isOpportunity || !recordId;

  const { record: personRecord, loading: personLoading } = useFindOneRecord({
    objectNameSingular: StandardObjectNameSingular.Person,
    objectRecordId: recordId ?? '',
    recordGqlFields: { id: true, emails: { primaryEmail: true } },
    skip: skipPerson,
  });

  const { records: companyPeople, loading: companyPeopleLoading } =
    useFindManyRecords({
      objectNameSingular: StandardObjectNameSingular.Person,
      filter: { companyId: { eq: recordId ?? '' } },
      recordGqlFields: { id: true, emails: { primaryEmail: true } },
      limit: 1,
      skip: skipCompanyPeople,
    });

  const { record: opportunityRecord, loading: opportunityLoading } =
    useFindOneRecord({
      objectNameSingular: StandardObjectNameSingular.Opportunity,
      objectRecordId: recordId ?? '',
      recordGqlFields: {
        id: true,
        pointOfContact: { id: true, emails: { primaryEmail: true } },
      },
      skip: skipOpportunity,
    });

  const defaultTo = isPerson
    ? (personRecord?.emails?.primaryEmail ?? '')
    : isCompany
      ? (companyPeople[0]?.emails?.primaryEmail ?? '')
      : isOpportunity
        ? (opportunityRecord?.pointOfContact?.emails?.primaryEmail ?? '')
        : '';

  const defaultRecipientPersonId = isPerson
    ? personRecord?.id
    : isCompany
      ? companyPeople[0]?.id
      : isOpportunity
        ? opportunityRecord?.pointOfContact?.id
        : undefined;

  const loading =
    (isPerson && personLoading) ||
    (isCompany && companyPeopleLoading) ||
    (isOpportunity && opportunityLoading);

  return { defaultRecipientPersonId, defaultTo, loading };
};
