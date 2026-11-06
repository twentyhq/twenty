import { mediaAccessSessionsState } from '@/media-access/states/mediaAccessSessionsState';
import { getIframeMediaPermissionMediaTypes } from '@/media-access/utils/getIframeMediaPermissionMediaTypes';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { type IframeMediaPermission } from 'twenty-shared/types';

type ManagedIframeMediaAccessSessionEffectProps = {
  id: string;
  ownerId: string;
  ownerName: string;
  permission: IframeMediaPermission;
  onStop: () => void;
};

export const ManagedIframeMediaAccessSessionEffect = ({
  id,
  ownerId,
  ownerName,
  permission,
  onStop,
}: ManagedIframeMediaAccessSessionEffectProps) => {
  const setMediaAccessSessions = useSetAtomState(mediaAccessSessionsState);

  useEffect(() => {
    setMediaAccessSessions((sessions) => [
      ...sessions.filter((session) => session.id !== id),
      {
        id,
        ownerId,
        ownerName,
        status: 'delegated',
        origin: permission.origin,
        mediaTypes: getIframeMediaPermissionMediaTypes(permission),
        onStop,
      },
    ]);

    return () => {
      setMediaAccessSessions((sessions) =>
        sessions.filter((session) => session.id !== id),
      );
    };
  }, [id, onStop, ownerId, ownerName, permission, setMediaAccessSessions]);

  return null;
};
