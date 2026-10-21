import { sanitizeImageLoadRequest } from '@/host/image-loading/utils/sanitizeImageLoadRequest';

const UNCONVERTIBLE_VALUE = { toString: 1 };

describe('sanitizeImageLoadRequest', () => {
  it('keeps well-formed requests and normalizes the referrer policy', () => {
    expect(
      sanitizeImageLoadRequest({
        requestId: '1',
        src: '/avatar.png',
        srcset: '/avatar@2x.png 2x',
        sizes: '40px',
        crossOrigin: 'anonymous',
        referrerPolicy: 'NO-REFERRER',
      }),
    ).toEqual({
      requestId: '1',
      src: '/avatar.png',
      srcset: '/avatar@2x.png 2x',
      sizes: '40px',
      crossOrigin: 'anonymous',
      referrerPolicy: 'no-referrer',
    });
  });

  it('drops fields that are not strings instead of converting them', () => {
    expect(
      sanitizeImageLoadRequest({
        requestId: '1',
        src: '/avatar.png',
        srcset: UNCONVERTIBLE_VALUE,
        sizes: UNCONVERTIBLE_VALUE,
        crossOrigin: UNCONVERTIBLE_VALUE,
        referrerPolicy: UNCONVERTIBLE_VALUE,
      }),
    ).toEqual({
      requestId: '1',
      src: '/avatar.png',
      srcset: null,
      sizes: '',
      crossOrigin: null,
      referrerPolicy: '',
    });
  });

  it('rejects values that are not request objects', () => {
    expect(sanitizeImageLoadRequest(null)).toBeNull();
    expect(sanitizeImageLoadRequest(undefined)).toBeNull();
    expect(sanitizeImageLoadRequest('/avatar.png')).toBeNull();
  });

  it('treats blank sources as absent', () => {
    expect(
      sanitizeImageLoadRequest({
        requestId: '1',
        src: ' /avatar.png ',
        srcset: ' ',
        sizes: '',
        crossOrigin: null,
        referrerPolicy: '',
      }),
    ).toMatchObject({ src: ' /avatar.png ', srcset: null });
  });

  it('rejects requests without an identifier or a usable source', () => {
    const request = {
      requestId: '1',
      src: '/avatar.png',
      srcset: null,
      sizes: '',
      crossOrigin: null,
      referrerPolicy: '',
    };

    expect(sanitizeImageLoadRequest({ ...request, requestId: 1 })).toBeNull();
    expect(
      sanitizeImageLoadRequest({ ...request, src: UNCONVERTIBLE_VALUE }),
    ).toBeNull();
    expect(sanitizeImageLoadRequest({ ...request, src: ' \n\t' })).toBeNull();
    expect(
      sanitizeImageLoadRequest({ ...request, src: '', srcset: ' ' }),
    ).toBeNull();
    expect(
      sanitizeImageLoadRequest({
        ...request,
        src: '/avatar.png',
        srcset: UNCONVERTIBLE_VALUE,
      }),
    ).not.toBeNull();
  });
});
