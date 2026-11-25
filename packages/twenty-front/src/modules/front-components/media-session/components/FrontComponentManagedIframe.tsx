import { useFrontComponentIframeOwnerOrThrow } from '@/front-components/media-session/contexts/FrontComponentIframeOwnerContext';
import { ManagedIframe } from '@/media-access/components/ManagedIframe';
import { limitToDocumentIframeMediaPermissions } from '@/media-access/utils/limitToDocumentIframeMediaPermissions';
import {
  type FrontComponentIframeHostProps,
  getRequestedIframeMediaCapabilities,
} from 'twenty-front-component-renderer';

type FrontComponentManagedIframeProps = FrontComponentIframeHostProps;

export const FrontComponentManagedIframe = ({
  iframeProps,
  iframeElement,
  renderIframe,
}: FrontComponentManagedIframeProps) => {
  const { owner, iframeMediaPermissions } =
    useFrontComponentIframeOwnerOrThrow();

  return (
    <ManagedIframe
      renderIframe={renderIframe}
      iframeElement={iframeElement}
      owner={owner}
      iframeMediaPermissions={limitToDocumentIframeMediaPermissions(
        iframeMediaPermissions,
      )}
      requestedMediaCapabilities={getRequestedIframeMediaCapabilities(
        iframeProps.allow,
      )}
      src={iframeProps.src}
      srcDoc={iframeProps.srcDoc}
      hidden={iframeProps.hidden}
      sandbox={iframeProps.sandbox}
      allow={iframeProps.allow}
    />
  );
};
