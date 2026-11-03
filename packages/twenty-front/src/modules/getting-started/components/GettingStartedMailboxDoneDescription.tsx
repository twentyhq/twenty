import { type GettingStartedStepDoneDescriptionProps } from '@/getting-started/types/GettingStartedStepDoneDescriptionProps';
import { formatNumber } from '@/localization/utils/formatNumber';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type GettingStartedMailboxDoneDescriptionProps =
  GettingStartedStepDoneDescriptionProps;

export const GettingStartedMailboxDoneDescription = ({
  description,
}: GettingStartedMailboxDoneDescriptionProps) => {
  const { t } = useLingui();
  const { totalCount: peopleCount } = useFindManyRecords({
    objectNameSingular: StandardObjectNameSingular.Person,
    limit: 1,
    recordGqlFields: { id: true },
  });
  const { totalCount: companyCount } = useFindManyRecords({
    objectNameSingular: StandardObjectNameSingular.Company,
    limit: 1,
    recordGqlFields: { id: true },
  });

  if (!isDefined(peopleCount) || !isDefined(companyCount)) {
    return description;
  }

  const formattedPeopleCount = formatNumber(peopleCount);
  const formattedCompanyCount = formatNumber(companyCount);

  return t`${plural(peopleCount, { one: `${formattedPeopleCount} person`, other: `${formattedPeopleCount} people` })} and ${plural(companyCount, { one: `${formattedCompanyCount} company`, other: `${formattedCompanyCount} companies` })} in your workspace`;
};
