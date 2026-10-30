import { type GettingStartedStepDoneDescriptionProps } from '@/getting-started/types/GettingStartedStepDoneDescriptionProps';
import { formatNumber } from '@/localization/utils/formatNumber';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useLingui } from '@lingui/react/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type GettingStartedMailboxDoneDescriptionProps =
  GettingStartedStepDoneDescriptionProps;

export const GettingStartedMailboxDoneDescription = ({
  description,
}: GettingStartedMailboxDoneDescriptionProps) => {
  const { t } = useLingui();
  const { totalCount: peopleCount } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    limit: 1,
    recordGqlFields: { id: true },
  });
  const { totalCount: companyCount } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Company,
    limit: 1,
    recordGqlFields: { id: true },
  });

  if (!isDefined(peopleCount) || !isDefined(companyCount)) {
    return description;
  }

  const formattedPeopleCount = formatNumber(peopleCount);
  const formattedCompanyCount = formatNumber(companyCount);

  return t`${formattedPeopleCount} people and ${formattedCompanyCount} companies in your workspace`;
};
