import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/display';
import { t } from '@lingui/core/macro';
import { SettingsServerlessFunctionsTable } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTable';
import { SettingsAIAgentsTable } from '~/pages/settings/ai/components/SettingsAIAgentsTable';
import { SettingsObjectTable } from '~/pages/settings/data-model/SettingsObjectTable';
import { isDefined } from 'twenty-shared/utils';
import { useRecoilValue } from 'recoil';
import { type Application } from '~/generated/graphql';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

export const SettingsApplicationDetailContentTab = ({
  application,
}: {
  application?: Omit<Application, 'objects'> & { objects: { id: string }[] };
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (!isDefined(application)) {
    return;
  }

  const { serverlessFunctions, agents, objects } = application;

  const shouldDisplayServerlessFunctions =
    isDefined(serverlessFunctions) && serverlessFunctions?.length > 0;

  const shouldDisplayAgents = isDefined(agents) && agents.length > 0;

  const shouldDisplayObjects = isDefined(objects) && objects.length > 0;

  const objectIds = objects.map((object) => object.id);

  const applicationObjectMetadataItems = shouldDisplayObjects
    ? objectMetadataItems.filter((objectMetadataItem) =>
        objectIds.includes(objectMetadataItem.id),
      )
    : [];

  return (
    <>
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
    </>
  );
};
