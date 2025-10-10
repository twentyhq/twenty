import { SettingsPath } from 'twenty-shared/types';
import { t } from '@lingui/core/macro';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useParams } from 'react-router-dom';
import { useFindOneApplicationQuery } from '~/generated-metadata/graphql';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/display';
import { SettingsApplicationDetailSkeletonLoader } from '~/pages/settings/applications/components/SettingsApplicationDetailSkeletonLoader';
import { SettingsServerlessFunctionsTable } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTable';
import { SettingsAIAgentsTable } from '~/pages/settings/ai/components/SettingsAIAgentsTable';
import { SettingsObjectTable } from '~/pages/settings/data-model/SettingsObjectTable';
import { useRecoilValue } from 'recoil';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

export const SettingsApplicationDetails = () => {
  const { applicationId = '' } = useParams<{ applicationId: string }>();

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { data, loading } = useFindOneApplicationQuery({
    variables: { id: applicationId },
    skip: !applicationId,
  });

  if (!isDefined(data?.findOneApplication)) {
    return;
  }

  const { serverlessFunctions, agents, objects } = data.findOneApplication;

  const shouldDisplayServerlessFunctions =
    !loading &&
    isDefined(serverlessFunctions) &&
    serverlessFunctions?.length > 0;

  const shouldDisplayAgents =
    !loading && isDefined(agents) && agents.length > 0;

  const shouldDisplayObjects =
    !loading && isDefined(objects) && objects.length > 0;

  const applicationObjectMetadataItems = shouldDisplayObjects
    ? objectMetadataItems.filter((objectMetadataItem) =>
        objects.map((object) => object.id).includes(objectMetadataItem.id),
      )
    : [];

  const title = loading
    ? t`Application details`
    : data?.findOneApplication?.name;

  return (
    <>
      <SubMenuTopBarContainer
        title={title}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Applications`,
            href: getSettingsPath(SettingsPath.Applications),
          },
          { children: t`Application` },
        ]}
      >
        <SettingsPageContainer>
          {loading && <SettingsApplicationDetailSkeletonLoader />}
          {shouldDisplayServerlessFunctions && (
            <Section>
              <H2Title
                title={t`Application serverless functions`}
                description={t`Serverless functions created by application`}
              />
              <SettingsServerlessFunctionsTable
                serverlessFunctions={serverlessFunctions}
              />
            </Section>
          )}
          {shouldDisplayAgents && (
            <Section>
              <H2Title
                title={t`Application agents`}
                description={t`Agents created by application`}
              />
              <SettingsAIAgentsTable agents={agents} withSearchBar={false} />
            </Section>
          )}
          {shouldDisplayObjects && (
            <Section>
              <H2Title
                title={t`Application objects`}
                description={t`Objects created by application`}
              />
              <SettingsObjectTable
                activeObjects={applicationObjectMetadataItems}
                inactiveObjects={[]}
                withSearchBar={false}
              />
            </Section>
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
