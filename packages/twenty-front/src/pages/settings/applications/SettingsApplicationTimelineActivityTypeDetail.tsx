import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { FindOneApplicationDocument } from '~/generated-metadata/graphql';
import { useApplicationTimelineActivityTypes } from '~/pages/settings/applications/hooks/useApplicationTimelineActivityTypes';
import { SettingsApplicationTimelineActivityTypeSettingsTab } from '~/pages/settings/applications/tabs/SettingsApplicationTimelineActivityTypeSettingsTab';
import { getSettingsApplicationTimelineActivityTypes } from '~/pages/settings/applications/utils/getSettingsApplicationTimelineActivityTypes';

export const SettingsApplicationTimelineActivityTypeDetail = () => {
  const { applicationId = '', timelineActivityTypeId = '' } = useParams<{
    applicationId: string;
    timelineActivityTypeId: string;
  }>();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { data, loading: applicationLoading } = useQuery(
    FindOneApplicationDocument,
    {
      variables: { id: applicationId },
      skip: !applicationId,
    },
  );
  const {
    installedTimelineActivityTypes,
    loading: timelineActivityTypesLoading,
    mutatingTimelineActivityTypeIds,
    resetTimelineActivityTypeToDefault,
    setTimelineActivityTypeIsActive,
  } = useApplicationTimelineActivityTypes({ isInstalledApplication: true });

  const application = data?.findOneApplication;
  const timelineActivityType = getSettingsApplicationTimelineActivityTypes({
    applicationId,
    isInstalledApplication: true,
    installedTimelineActivityTypes,
    manifestTimelineActivityTypes: [],
  }).find(({ id }) => id === timelineActivityTypeId);
  const applicationContentHref = getSettingsPath(
    SettingsPath.ApplicationDetail,
    { applicationId },
    undefined,
    'content',
  );
  const isMutating = mutatingTimelineActivityTypeIds.has(
    timelineActivityTypeId,
  );
  const canReset =
    isDefined(currentWorkspace?.workspaceCustomApplication?.id) &&
    !isWorkspaceCustomApplication({ id: applicationId }, currentWorkspace);

  return (
    <SettingsPageLayout
      title={timelineActivityType?.label ?? t`Timeline activity type`}
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
        {
          children: t`Timeline activity types`,
          href: applicationContentHref,
        },
        { children: timelineActivityType?.label ?? '' },
      ]}
    >
      <SettingsPageContainer>
        {applicationLoading ||
        timelineActivityTypesLoading ||
        !isDefined(timelineActivityType) ? (
          <SettingsSectionSkeletonLoader />
        ) : (
          <SettingsApplicationTimelineActivityTypeSettingsTab
            timelineActivityType={timelineActivityType}
            canReset={canReset}
            disabled={isMutating}
            onIsActiveChange={(isActive) =>
              setTimelineActivityTypeIsActive({
                id: timelineActivityType.id,
                isActive,
              })
            }
            onReset={() =>
              resetTimelineActivityTypeToDefault(timelineActivityType.id)
            }
          />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
