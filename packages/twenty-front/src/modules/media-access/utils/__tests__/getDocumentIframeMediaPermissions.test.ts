import { getDocumentIframeMediaPermissions } from '@/media-access/utils/getDocumentIframeMediaPermissions';
import { IFRAME_MEDIA_PERMISSIONS_BOOTSTRAP_ELEMENT_ID } from 'twenty-shared/constants';

const appendBootstrapElement = (content: string) => {
  const element = document.createElement('script');

  element.id = IFRAME_MEDIA_PERMISSIONS_BOOTSTRAP_ELEMENT_ID;
  element.type = 'application/json';
  element.textContent = content;
  document.head.append(element);
};

describe('getDocumentIframeMediaPermissions', () => {
  afterEach(() => {
    document
      .getElementById(IFRAME_MEDIA_PERMISSIONS_BOOTSTRAP_ELEMENT_ID)
      ?.remove();
  });

  it('returns undefined when the document was not served with a media policy', () => {
    expect(getDocumentIframeMediaPermissions()).toBeUndefined();
  });

  it('returns the valid permissions served with the document', () => {
    appendBootstrapElement(
      JSON.stringify([
        {
          origin: 'https://phone.example.com',
          microphone: true,
          camera: false,
        },
        {
          origin: 'https://video.example.com',
          microphone: 'yes',
          camera: true,
        },
      ]),
    );

    expect(getDocumentIframeMediaPermissions()).toEqual([
      { origin: 'https://phone.example.com', microphone: true, camera: false },
    ]);
  });

  it.each(['not json', '{}'])(
    'denies every origin when the served policy is malformed: %s',
    (content) => {
      appendBootstrapElement(content);

      expect(getDocumentIframeMediaPermissions()).toEqual([]);
    },
  );
});
