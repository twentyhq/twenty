import { AppChip } from '@/applications/components/AppChip';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { FindOneApplicationDocument } from '~/generated-metadata/graphql';
import { SettingsApplicationTimelineActivityTypesListCard } from '~/pages/settings/applications/components/SettingsApplicationTimelineActivityTypesListCard';
import { useApplicationTimelineActivityTypes } from '~/pages/settings/applications/hooks/useApplicationTimelineActivityTypes';
import { getSettingsApplicationTimelineActivityTypes } from '~/pages/settings/applications/utils/getSettingsApplicationTimelineActivityTypes';
import { filterSettingsApplicationTimelineActivityTypes } from '~/pages/settings/applications/utils/filterSettingsApplicationTimelineActivityTypes';

export const SettingsApplicationTimelineActivityTypes = () => {
  const { t } = useLingui();
  const { applicationId = '' } = useParams<{ applicationId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { data: applicationData, loading: applicationLoading } = useQuery(
    FindOneApplicationDocument,
    {
      variables: { id: applicationId },
      skip: !applicationId,
    },
  );
  const application = applicationData?.findOneApplication;

  const {
    installedTimelineActivityTypes,
    loading: timelineActivityTypesLoading,
    mutatingTimelineActivityTypeIds,
    resetTimelineActivityTypeToDefault,
    setTimelineActivityTypeIsActive,
  } = useApplicationTimelineActivityTypes({
    isInstalledApplication: true,
  });

  const timelineActivityTypes = getSettingsApplicationTimelineActivityTypes({
    applicationId,
    isInstalledApplication: true,
    installedTimelineActivityTypes,
    manifestTimelineActivityTypes: [],
  });
  const filteredTimelineActivityTypes =
    filterSettingsApplicationTimelineActivityTypes({
      timelineActivityTypes,
      searchTerm,
    });

  const applicationContentHref = getSettingsPath(
    SettingsPath.ApplicationDetail,
    { applicationId },
    undefined,
    'content',
  );

  return (
    <SettingsPageLayout
      title={t`Timeline activity types`}
      icon={
        isDefined(application) ? (
          <AppChip
            applicationId={application.id}
            logoUrl={application.logoUrl}
            fallbackApplicationData={{ name: application.name }}
            size="md"
            chipOnly
          />
        ) : undefined
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Applications`,
          href: getSettingsPath(SettingsPath.Applications),
        },
        {
          children: application?.name ?? '',
          href: applicationContentHref,
        },
        { children: t`Timeline activity types` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Activity visibility`}
            description={t`Choose which activity types appear in record timelines`}
          />
          <SearchInput
            placeholder={t`Search activity types...`}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </Section>
        <Section>
          <SettingsApplicationTimelineActivityTypesListCard
            timelineActivityTypes={filteredTimelineActivityTypes}
            canReset={
              !isWorkspaceCustomApplication(
                { id: applicationId },
                currentWorkspace,
              )
            }
            isLoading={applicationLoading || timelineActivityTypesLoading}
            mutatingTimelineActivityTypeIds={mutatingTimelineActivityTypeIds}
            onToggle={setTimelineActivityTypeIsActive}
            onReset={resetTimelineActivityTypeToDefault}
          />
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
