import { limitToDocumentIframeMediaPermissions } from '@/media-access/utils/limitToDocumentIframeMediaPermissions';
import { IFRAME_MEDIA_PERMISSIONS_BOOTSTRAP_ELEMENT_ID } from 'twenty-shared/constants';

const PHONE_ORIGIN = 'https://phone.example.com';
const VIDEO_ORIGIN = 'https://video.example.com';

const PERMISSIONS = [
  { origin: PHONE_ORIGIN, microphone: true, camera: false },
  { origin: VIDEO_ORIGIN, microphone: true, camera: true },
];

describe('limitToDocumentIframeMediaPermissions', () => {
  afterEach(() => {
    document
      .getElementById(IFRAME_MEDIA_PERMISSIONS_BOOTSTRAP_ELEMENT_ID)
      ?.remove();
  });

  it('keeps the permissions when the document was not served with a media policy', () => {
    expect(limitToDocumentIframeMediaPermissions(PERMISSIONS)).toEqual(
      PERMISSIONS,
    );
  });

  it('ignores origins approved after the document was served', () => {
    const element = document.createElement('script');

    element.id = IFRAME_MEDIA_PERMISSIONS_BOOTSTRAP_ELEMENT_ID;
    element.type = 'application/json';
    element.textContent = JSON.stringify([PERMISSIONS[0]]);
    document.head.append(element);

    expect(limitToDocumentIframeMediaPermissions(PERMISSIONS)).toEqual([
      PERMISSIONS[0],
    ]);
  });
});
