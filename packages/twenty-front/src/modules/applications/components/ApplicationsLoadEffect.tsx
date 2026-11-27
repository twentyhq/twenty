import { useRefreshWorkspaceInstalledApplications } from '@/applications/hooks/useRefreshWorkspaceInstalledApplications';
import { applicationBroadcastEventCountState } from '@/applications/states/applicationBroadcastEventCountState';
import { workspaceInstalledApplicationsVersionState } from '@/applications/states/workspaceInstalledApplicationsRefreshState';
import { applicationsLoadSequenceState } from '@/applications/states/applicationsLoadSequenceState';
import { useIsOnAuthOrOnboardingPage } from '@/auth/hooks/useIsOnAuthOrOnboardingPage';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  FindManyApplicationsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const APPLICATIONS_LOAD_MAX_ATTEMPTS = 3;

const INSTALLED_APPLICATION_MUTABLE_FIELDS = [
  'name',
  'description',
  'logo',
  'isUserHealthCheckEnabled',
  'universalIdentifier',
  'deletedAt',
];

export const ApplicationsLoadEffect = () => {
  const client = useApolloClient();
  const refreshWorkspaceInstalledApplications =
    useRefreshWorkspaceInstalledApplications();
  const store = useStore();
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const hasApplicationsPermission = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );

  const isOnAuthOrOnboardingPage = useIsOnAuthOrOnboardingPage();

  const refreshInstalledApplications = useCallback(() => {
    store.set(
      workspaceInstalledApplicationsVersionState.atom,
      (version) => version + 1,
    );
    void refreshWorkspaceInstalledApplications();
  }, [store, refreshWorkspaceInstalledApplications]);

  useListenToMetadataOperationBrowserEvent<FlatApplication>({
    metadataName: 'application',
    onMetadataOperationBrowserEvent: ({ operation }) => {
      store.set(
        applicationBroadcastEventCountState.atom,
        (eventCount) => eventCount + 1,
      );
      if (
        operation.type !== 'update' ||
        !isDefined(operation.updatedFields) ||
        operation.updatedFields.some((field) =>
          INSTALLED_APPLICATION_MUTABLE_FIELDS.includes(field),
        )
      ) {
        refreshInstalledApplications();
      }
    },
  });

  const loadApplications = useCallback(async () => {
    const loadSequence = store.get(applicationsLoadSequenceState.atom) + 1;

    store.set(applicationsLoadSequenceState.atom, loadSequence);

    if (!hasApplicationsPermission || isOnAuthOrOnboardingPage) {
      return;
    }

    for (
      let attempt = 0;
      attempt < APPLICATIONS_LOAD_MAX_ATTEMPTS;
      attempt += 1
    ) {
      const eventCountBeforeQuery = store.get(
        applicationBroadcastEventCountState.atom,
      );

      const result = await client
        .query({
          query: FindManyApplicationsDocument,
          fetchPolicy: 'network-only',
          context: { queryDeduplication: false },
        })
        .catch(() => null);

      if (store.get(applicationsLoadSequenceState.atom) !== loadSequence) {
        return;
      }

      if (!isDefined(result)) {
        continue;
      }

      if (!isDefined(result.data?.findManyApplications)) {
        return;
      }

      const hasReceivedEventsDuringQuery =
        store.get(applicationBroadcastEventCountState.atom) !==
        eventCountBeforeQuery;

      if (hasReceivedEventsDuringQuery) {
        continue;
      }

      const applications: FlatApplication[] =
        result.data.findManyApplications.map((application) => ({
          id: application.id,
          universalIdentifier: application.universalIdentifier,
          name: application.name,
          description: application.description,
          version: application.version,
          applicationRegistrationId: application.applicationRegistrationId,
        }));

      replaceDraft('applications', applications);
      applyChanges();

      return;
    }
  }, [
    client,
    store,
    hasApplicationsPermission,
    isOnAuthOrOnboardingPage,
    replaceDraft,
    applyChanges,
  ]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: () => {
      refreshInstalledApplications();
      void loadApplications();
    },
  });

  return null;
};
