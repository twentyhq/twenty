import { useFirstConnectedAccount } from '@/activities/emails/hooks/useFirstConnectedAccount';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { CoreObjectNameSingular, SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const ComposeEmailButton = () => {
  const targetRecord = useTargetRecord();
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();
  const navigateSettings = useNavigateSettings();
  const { connectedAccountId, loading: accountLoading } =
    useFirstConnectedAccount();

  const isPerson =
    targetRecord.targetObjectNameSingular === CoreObjectNameSingular.Person;
  const isCompany =
    targetRecord.targetObjectNameSingular === CoreObjectNameSingular.Company;
  const isOpportunity =
    targetRecord.targetObjectNameSingular ===
    CoreObjectNameSingular.Opportunity;

  const { record: personRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Person,
    objectRecordId: targetRecord.id,
    recordGqlFields: { id: true, emails: { primaryEmail: true } },
    skip: !isPerson,
  });

  const { records: companyPeople } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: { companyId: { eq: targetRecord.id } },
    recordGqlFields: { id: true, emails: { primaryEmail: true } },
    limit: 1,
    skip: !isCompany,
  });

  const { record: opportunityRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
    objectRecordId: targetRecord.id,
    recordGqlFields: {
      id: true,
      pointOfContact: { id: true, emails: { primaryEmail: true } },
      company: { id: true },
    },
    skip: !isOpportunity,
  });

  const resolveDefaultTo = (): string => {
    if (isPerson) {
      return personRecord?.emails?.primaryEmail ?? '';
    }
    if (isCompany) {
      return companyPeople[0]?.emails?.primaryEmail ?? '';
    }
    if (isOpportunity) {
      return opportunityRecord?.pointOfContact?.emails?.primaryEmail ?? '';
    }
    return '';
  };

  const handleClick = () => {
    if (!isDefined(connectedAccountId)) {
      navigateSettings(SettingsPath.NewAccount);

      return;
    }

    openComposeEmailInSidePanel({
      connectedAccountId,
      defaultTo: resolveDefaultTo(),
    });
  };

  if (accountLoading) {
    return null;
  }

  return (
    <LightIconButton
      Icon={IconPlus}
      accent="tertiary"
      size="small"
      onClick={handleClick}
    />
  );
};
