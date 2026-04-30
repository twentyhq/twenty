import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { CoreObjectNameSingular } from 'twenty-shared/types';

type UseResolveDefaultEmailRecipientParams = {
  objectNameSingular: string | null | undefined;
  recordId: string | null | undefined;
};

export const useResolveDefaultEmailRecipient = ({
  objectNameSingular,
  recordId,
}: UseResolveDefaultEmailRecipientParams) => {
  const isPerson = objectNameSingular === CoreObjectNameSingular.Person;
  const isCompany = objectNameSingular === CoreObjectNameSingular.Company;
  const isOpportunity =
    objectNameSingular === CoreObjectNameSingular.Opportunity;

  const skipPerson = !isPerson || !recordId;
  const skipCompanyPeople = !isCompany || !recordId;
  const skipOpportunity = !isOpportunity || !recordId;

  const { record: personRecord, loading: personLoading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Person,
    objectRecordId: recordId ?? '',
    recordGqlFields: { id: true, emails: { primaryEmail: true } },
    skip: skipPerson,
  });

  const { records: companyPeople, loading: companyPeopleLoading } =
    useFindManyRecords({
      objectNameSingular: CoreObjectNameSingular.Person,
      filter: { companyId: { eq: recordId ?? '' } },
      recordGqlFields: { id: true, emails: { primaryEmail: true } },
      limit: 1,
      skip: skipCompanyPeople,
    });

  const { record: opportunityRecord, loading: opportunityLoading } =
    useFindOneRecord({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
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

  const loading =
    (isPerson && personLoading) ||
    (isCompany && companyPeopleLoading) ||
    (isOpportunity && opportunityLoading);

  return { defaultTo, loading };
};
