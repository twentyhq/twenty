import { ManagedIframeEnableButton } from '@/media-access/components/ManagedIframeEnableButton';
import { ManagedIframeMediaAccessSessionEffect } from '@/media-access/components/ManagedIframeMediaAccessSessionEffect';
import { ManagedIframePermissionDialogEffect } from '@/media-access/components/ManagedIframePermissionDialogEffect';
import { type ManagedIframeElementProps } from '@/media-access/types/ManagedIframeElementProps';
import { getDelegatedIframeMediaPermission } from '@/media-access/utils/getDelegatedIframeMediaPermission';
import { isIframeMediaPermissionCovered } from '@/media-access/utils/isIframeMediaPermissionCovered';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment, useCallback, useId, useState } from 'react';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { getIframeMediaAllow, isDefined } from 'twenty-shared/utils';

type ManagedIframeSessionProps = ManagedIframeElementProps & {
  ownerId: string;
  ownerName: string;
  shouldRequireConfirmation: boolean;
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
  shouldRequireConfirmation,
  permission,
}: ManagedIframeSessionProps) => {
  const mediaAccessSessionId = useId();
  const confirmationDialogId = useId();
  const { openDialog } = useDialog();
  const [permissionAwaitingConfirmation, setPermissionAwaitingConfirmation] =
    useState<IframeMediaPermission | null>(null);
  const [nativeIframeElement, setNativeIframeElement] =
    useState<HTMLIFrameElement | null>(null);
  const [activatedPermission, setActivatedPermission] =
    useState<IframeMediaPermission | null>(null);
  const delegatedPermission = getDelegatedIframeMediaPermission({
    activatedPermission,
    permission,
  });
  const isActivated = isDefined(delegatedPermission);
  const isAvailablePermissionActivated =
    isDefined(permission) &&
    isIframeMediaPermissionCovered({
      permission,
      coveringPermission: delegatedPermission,
    });

  if (isDefined(activatedPermission) && !isActivated) {
    setActivatedPermission(null);
  }

  const anchorElement = iframeElement ?? nativeIframeElement;
  const handleDeactivate = useCallback(() => {
    setActivatedPermission(null);
  }, []);
  const handleEnable = () => {
    if (shouldRequireConfirmation) {
      setPermissionAwaitingConfirmation(permission);
      openDialog(confirmationDialogId);

      return;
    }

    setActivatedPermission(permission);
  };
  const permissionToConfirm = getDelegatedIframeMediaPermission({
    activatedPermission: permissionAwaitingConfirmation,
    permission,
  });
  const hasInvalidRequest =
    isDefined(permissionAwaitingConfirmation) &&
    !isDefined(permissionToConfirm);
  const handleConfirm = () => {
    setActivatedPermission(permissionToConfirm);
    setPermissionAwaitingConfirmation(null);
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
      {shouldRequireConfirmation && (
        <ManagedIframePermissionDialogEffect
          dialogId={confirmationDialogId}
          hasInvalidRequest={hasInvalidRequest}
          onReset={setPermissionAwaitingConfirmation}
        />
      )}
      {isDefined(permissionAwaitingConfirmation) && (
        <ConfirmationDialog
          shouldIsolateAppEvents
          dialogId={confirmationDialogId}
          title={t`Enable media access for ${ownerName}?`}
          subtitle={
            <>
              <div>{getEnableLabel(permissionAwaitingConfirmation)}</div>
              <div>{permissionAwaitingConfirmation.origin}</div>
            </>
          }
          confirmButtonText={t`Enable`}
          confirmButtonColor="neutral"
          isConfirmButtonDisabled={!isDefined(permissionToConfirm)}
          onConfirmClick={handleConfirm}
          onClose={() => setPermissionAwaitingConfirmation(null)}
        />
      )}
      {isDefined(delegatedPermission) && (
        <ManagedIframeMediaAccessSessionEffect
          id={mediaAccessSessionId}
          ownerId={ownerId}
          ownerName={ownerName}
          permission={delegatedPermission}
          onStop={handleDeactivate}
        />
      )}
      <Fragment key={iframeAllow}>
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
        !isAvailablePermissionActivated &&
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
