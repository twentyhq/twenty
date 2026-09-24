import { createFrontComponentMediaCapabilityPolicy } from '@/front-components/media-session/utils/createFrontComponentMediaCapabilityPolicy';
import { type FrontComponentMediaPermissionRequest } from '@/front-components/media-session/types/FrontComponentMediaPermissionRequest';
import { getMissingFrontComponentMediaCapabilities } from '@/front-components/media-session/utils/getMissingFrontComponentMediaCapabilities';
import { waitForFrontComponentMediaPermission } from '@/front-components/media-session/utils/waitForFrontComponentMediaPermission';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useApolloClient } from '@apollo/client/react';
import { useId, useState } from 'react';
import {
  createFrontComponentMediaSessionHost,
  type FrontComponentActiveMediaSession,
  type FrontComponentMediaSessionHost,
  type MediaSessionMediaType,
} from 'twenty-front-component-renderer';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { FindFrontComponentApplicationCapabilitiesDocument } from '~/generated-metadata/graphql';

export const useFrontComponentMediaSession = ({
  frontComponentId,
}: {
  frontComponentId: string;
}) => {
  const apolloClient = useApolloClient();
  const { openDialog, closeDialog } = useDialog();
  const permissionModalInstanceId = useId();
  const [permissionRequest, setPermissionRequest] =
    useState<FrontComponentMediaPermissionRequest | null>(null);

  const [pendingStartMediaTypes, setPendingStartMediaTypes] = useState<
    MediaSessionMediaType[] | null
  >(null);
  const [activeSessions, setActiveSessions] = useState<
    FrontComponentActiveMediaSession[]
  >([]);
  const [mediaSessionHost] = useState<FrontComponentMediaSessionHost>(() =>
    createFrontComponentMediaSessionHost({
      beforeStartStream: createFrontComponentMediaCapabilityPolicy({
        getGrantedCapabilities: () =>
          apolloClient.cache.readQuery({
            query: FindFrontComponentApplicationCapabilitiesDocument,
            variables: { id: frontComponentId },
          })?.frontComponent?.applicationGrantedCapabilities ?? [],
        requestApproval: async ({ mediaTypes, abortSignal }) => {
          const { data } = await apolloClient.query({
            query: FindFrontComponentApplicationCapabilitiesDocument,
            variables: { id: frontComponentId },
            fetchPolicy: 'network-only',
            context: { fetchOptions: { signal: abortSignal } },
          });
          const grantedCapabilities =
            data?.frontComponent?.applicationGrantedCapabilities ?? [];
          const missingCapabilities = getMissingFrontComponentMediaCapabilities(
            {
              grantedCapabilities,
              mediaTypes,
            },
          );

          if (!isNonEmptyArray(missingCapabilities) || abortSignal.aborted) {
            return grantedCapabilities;
          }

          const approvedCapabilities =
            await waitForFrontComponentMediaPermission({
              capabilities: missingCapabilities,
              abortSignal,
              onRequestChange: (request) => {
                setPermissionRequest(request);

                if (isDefined(request)) {
                  openDialog(permissionModalInstanceId);
                  return;
                }

                closeDialog(permissionModalInstanceId);
              },
            });

          if (!isDefined(approvedCapabilities) || abortSignal.aborted) {
            return grantedCapabilities;
          }

          apolloClient.cache.updateQuery(
            {
              query: FindFrontComponentApplicationCapabilitiesDocument,
              variables: { id: frontComponentId },
            },
            (existingData) => {
              if (!isDefined(existingData?.frontComponent)) {
                return existingData;
              }

              return {
                ...existingData,
                frontComponent: {
                  ...existingData.frontComponent,
                  applicationGrantedCapabilities: approvedCapabilities,
                },
              };
            },
          );

          return approvedCapabilities;
        },
      }),
      onActiveSessionsChange: setActiveSessions,
      onPendingStartChange: setPendingStartMediaTypes,
    }),
  );

  return {
    activeSessions,
    mediaSessionHost,
    pendingStartMediaTypes,
    permissionModalInstanceId,
    permissionRequest,
    stopMediaSession: mediaSessionHost.stopAllSessions,
  };
};
