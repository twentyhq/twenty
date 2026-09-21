import { frontComponentMediaSessionsState } from '@/front-components/media-session/states/frontComponentMediaSessionsState';
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
  const setFrontComponentMediaSessions = useSetAtomState(
    frontComponentMediaSessionsState,
  );

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

    setFrontComponentMediaSessions((sessions) => [
      ...sessions.filter((session) => session.id !== id),
      {
        id,
        applicationId,
        applicationName,
        activeMediaTypes,
        pendingMediaTypes,
        onStop,
      },
    ]);

    return () => {
      setFrontComponentMediaSessions((sessions) =>
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
    setFrontComponentMediaSessions,
  ]);

  return null;
};
