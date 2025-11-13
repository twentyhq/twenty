import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { SettingsServerlessFunctionsTable } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTable';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type Application } from '~/generated/graphql';
import { SettingsAIAgentsTable } from '~/pages/settings/ai/components/SettingsAIAgentsTable';
import { SettingsObjectTable } from '~/pages/settings/data-model/SettingsObjectTable';

export const SettingsApplicationDetailContentTab = ({
  application,
}: {
  application?: Omit<Application, 'objects' | 'universalIdentifier'> & {
    objects: { id: string }[];
  };
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (!isDefined(application)) {
    return null;
  }

  const { serverlessFunctions, agents, objects } = application;

  const shouldDisplayServerlessFunctions =
    isDefined(serverlessFunctions) && serverlessFunctions?.length > 0;

  const shouldDisplayAgents = isDefined(agents) && agents.length > 0;

  const shouldDisplayObjects = isDefined(objects) && objects.length > 0;

  const applicationObjectMetadataItems = shouldDisplayObjects
    ? objectMetadataItems.filter((objectMetadataItem) =>
        objects.map((object) => object.id).includes(objectMetadataItem.id),
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
          <SettingsAIAgentsTable withSearchBar={false} />
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
