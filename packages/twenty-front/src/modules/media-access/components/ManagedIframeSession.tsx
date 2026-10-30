import { ManagedIframeEnableButton } from '@/media-access/components/ManagedIframeEnableButton';
import { ManagedIframeMediaAccessSessionEffect } from '@/media-access/components/ManagedIframeMediaAccessSessionEffect';
import { type ManagedIframeElementProps } from '@/media-access/types/ManagedIframeElementProps';
import { getDelegatedIframeMediaPermission } from '@/media-access/utils/getDelegatedIframeMediaPermission';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment, useCallback, useId, useState } from 'react';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { getIframeMediaAllow, isDefined } from 'twenty-shared/utils';

type ManagedIframeSessionProps = ManagedIframeElementProps & {
  ownerId: string;
  ownerName: string;
  permission: IframeMediaPermission | null;
};

const getEnableLabel = (permission: IframeMediaPermission) => {
  if (permission.microphone && permission.camera) {
    return t`Enable microphone and camera`;
  }

  if (permission.camera) {
    return t`Enable camera`;
  }

  return t`Enable microphone`;
};

export const ManagedIframeSession = ({
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
  renderIframe,
  iframeElement,
  ownerId,
  ownerName,
  permission,
}: ManagedIframeSessionProps) => {
  const mediaAccessSessionId = useId();
  const [nativeIframeElement, setNativeIframeElement] =
    useState<HTMLIFrameElement | null>(null);
  const [activatedPermission, setActivatedPermission] =
    useState<IframeMediaPermission | null>(null);
  const delegatedPermission = getDelegatedIframeMediaPermission({
    activatedPermission,
    permission,
  });
  const isActivated = isDefined(delegatedPermission);

  if (isDefined(activatedPermission) && !isActivated) {
    setActivatedPermission(null);
  }

  const anchorElement = iframeElement ?? nativeIframeElement;
  const handleDeactivate = useCallback(() => {
    setActivatedPermission(null);
  }, []);
  const handleEnable = () => {
    setActivatedPermission(permission);
  };
  const iframeAllow = getIframeMediaAllow({
    allow,
    permission: delegatedPermission,
  });
  const iframeSandbox =
    isActivated && isDefined(sandbox)
      ? [
          ...new Set([
            ...sandbox.split(/\s+/).filter(isNonEmptyString),
            'allow-same-origin',
          ]),
        ].join(' ')
      : sandbox;

  return (
    <>
      {isDefined(delegatedPermission) && (
        <ManagedIframeMediaAccessSessionEffect
          id={mediaAccessSessionId}
          ownerId={ownerId}
          ownerName={ownerName}
          permission={delegatedPermission}
          onStop={handleDeactivate}
        />
      )}
      <Fragment key={isActivated ? 'media-enabled' : 'media-disabled'}>
        {isDefined(renderIframe) ? (
          renderIframe({ allow: iframeAllow, sandbox: iframeSandbox })
        ) : (
          <iframe
            ref={setNativeIframeElement}
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
            sandbox={iframeSandbox}
            allow={iframeAllow}
            allowFullScreen={allowFullScreen}
          />
        )}
      </Fragment>
      {isDefined(permission) &&
        !isActivated &&
        !hidden &&
        isDefined(anchorElement) && (
          <ManagedIframeEnableButton
            anchorElement={anchorElement}
            label={getEnableLabel(permission)}
            onClick={handleEnable}
          />
        )}
    </>
  );
};
