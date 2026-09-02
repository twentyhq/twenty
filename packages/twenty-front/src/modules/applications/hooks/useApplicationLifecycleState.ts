import { applicationsSelector } from '@/applications/states/applicationsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { type ApplicationState } from '~/generated-metadata/graphql';

export const useApplicationLifecycleState = ({
  applicationId,
  universalIdentifier,
}: {
  applicationId?: string;
  universalIdentifier?: string;
}): ApplicationState | undefined => {
  const applications = useAtomStateValue(applicationsSelector);

  return applications.find(
    (application) =>
      (isDefined(applicationId) && application.id === applicationId) ||
      (isDefined(universalIdentifier) &&
        application.universalIdentifier === universalIdentifier),
  )?.state;
};
