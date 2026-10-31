import { mediaAccessSessionsState } from '@/media-access/states/mediaAccessSessionsState';
import { getMediaAccessOwnerId } from '@/media-access/utils/getMediaAccessOwnerId';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect, useId } from 'react';
import {
  type FrontComponentActiveMediaSession,
  type MediaSessionMediaType,
} from 'twenty-front-component-renderer';
import { isNonEmptyArray } from 'twenty-shared/utils';

type FrontComponentMediaSessionRegistrationEffectProps = {
  activeSessions: FrontComponentActiveMediaSession[];
  applicationId: string;
  applicationName: string;
  pendingStartMediaTypes: MediaSessionMediaType[] | null;
  onStop: () => void;
};

export const FrontComponentMediaSessionRegistrationEffect = ({
  activeSessions,
  applicationId,
  applicationName,
  pendingStartMediaTypes,
  onStop,
}: FrontComponentMediaSessionRegistrationEffectProps) => {
  const id = useId();
  const setMediaAccessSessions = useSetAtomState(mediaAccessSessionsState);

  useEffect(() => {
    const activeMediaTypes = [
      ...new Set(activeSessions.flatMap((session) => session.mediaTypes)),
    ];
    const pendingMediaTypes = pendingStartMediaTypes ?? [];

    if (
      !isNonEmptyArray(activeMediaTypes) &&
      !isNonEmptyArray(pendingMediaTypes)
    ) {
      return;
    }

    setMediaAccessSessions((sessions) => [
      ...sessions.filter((session) => session.id !== id),
      {
        id,
        ownerId: getMediaAccessOwnerId({
          type: 'application',
          id: applicationId,
        }),
        ownerName: applicationName,
        status: isNonEmptyArray(activeMediaTypes) ? 'capturing' : 'pending',
        mediaTypes: isNonEmptyArray(activeMediaTypes)
          ? activeMediaTypes
          : pendingMediaTypes,
        onStop,
      },
    ]);

    return () => {
      setMediaAccessSessions((sessions) =>
        sessions.filter((session) => session.id !== id),
      );
    };
  }, [
    activeSessions,
    applicationId,
    applicationName,
    id,
    onStop,
    pendingStartMediaTypes,
    setMediaAccessSessions,
  ]);

  return null;
};
