import { ManagedIframeSession } from '@/media-access/components/ManagedIframeSession';
import { type ManagedIframeProps } from '@/media-access/types/ManagedIframeProps';
import { getManagedIframeMediaPermission } from '@/media-access/utils/getManagedIframeMediaPermission';
import { getMediaAccessOwnerId } from '@/media-access/utils/getMediaAccessOwnerId';

export const ManagedIframe = ({
  src,
  srcDoc,
  title,
  className,
  style,
  width,
  height,
  hidden,
  onLoad,
  onError,
  sandbox,
  allow,
  allowFullScreen,
  owner,
  requestedMediaCapabilities,
  iframeMediaPermissions,
}: ManagedIframeProps) => {
  const permission = getManagedIframeMediaPermission({
    src,
    srcDoc,
    requestedMediaCapabilities,
    iframeMediaPermissions,
    hostOrigin: window.location.origin,
  });
  const ownerId = getMediaAccessOwnerId(owner);

  return (
    <ManagedIframeSession
      key={ownerId}
      src={src}
      srcDoc={srcDoc}
      title={title}
      className={className}
      style={style}
      width={width}
      height={height}
      hidden={hidden}
      onLoad={onLoad}
      onError={onError}
      sandbox={sandbox}
      allow={allow}
      allowFullScreen={allowFullScreen}
      ownerId={ownerId}
      ownerName={owner.name}
      permission={permission}
    />
  );
};
