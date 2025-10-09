import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthRecordGqlFields } from '@/object-record/graphql/utils/generateDepthRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountLoader } from '@/settings/accounts/components/SettingsAccountLoader';
import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountsConnectedAccountsListCard } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsListCard';
import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

export const SettingsAccounts = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
  });

  const { records: accounts, loading } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
    recordGqlFields: generateDepthRecordGqlFields({
      objectMetadataItem,
      objectMetadataItems: [objectMetadataItem],
      depth: 1,
    }),
  });

  return (
    <SubMenuTopBarContainer
      title={t`Account`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: t`Account` },
      ]}
    >
      <SettingsPageContainer>
        {loading ? (
          <SettingsAccountLoader />
        ) : (
          <>
            <Section>
              <H2Title
                title={t`Connected accounts`}
                description={t`Manage your internet accounts.`}
              />
              <SettingsAccountsConnectedAccountsListCard accounts={accounts} />
            </Section>
            <SettingsAccountsBlocklistSection />
            <SettingsAccountsSettingsSection />
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
