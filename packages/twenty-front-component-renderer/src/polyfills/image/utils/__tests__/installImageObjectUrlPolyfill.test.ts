import { type RemoteElementSerialization } from '@remote-dom/core';
import { serializeRemoteNode } from '@remote-dom/core/elements';

import { IMAGE_OBJECT_URL_BLOB_PROPERTY } from '@/constants/ImageObjectUrlBlobProperty';
import { HtmlImgElement } from '@/remote/generated/remote-elements';

import { installImageObjectUrlPolyfill } from '../installImageObjectUrlPolyfill';

class ImageUrl extends URL {
  static createObjectURL = jest.fn(
    (_blob: Blob | MediaSource) => 'blob:worker/owned',
  );
  static revokeObjectURL = jest.fn();
}

installImageObjectUrlPolyfill({
  urlConstructor: ImageUrl,
  imageElementPrototype: HtmlImgElement.prototype,
});

const createImageWithObjectUrl = () => {
  const blob = new Blob(['image'], { type: 'image/png' });
  const url = ImageUrl.createObjectURL(blob);
  const image = document.createElement(
    'html-img',
  ) as unknown as HTMLImageElement;
  image.src = url;
  return { blob, url, image };
};

const readImageObjectUrlBlob = (image: HTMLImageElement) =>
  (serializeRemoteNode(image) as RemoteElementSerialization).properties?.[
    IMAGE_OBJECT_URL_BLOB_PROPERTY
  ];

describe('installImageObjectUrlPolyfill', () => {
  it('bridges only locally created blobs and clears their image bindings on revocation', () => {
    const { blob, url, image } = createImageWithObjectUrl();
    expect(readImageObjectUrlBlob(image)).toBe(blob);
    expect(image.src).toBe(url);
    ImageUrl.revokeObjectURL(url);
    expect(readImageObjectUrlBlob(image)).toBeUndefined();
    image.src = 'blob:other-worker/unowned';
    expect(readImageObjectUrlBlob(image)).toBeUndefined();
  });

  it('does not clear a replacement image source when its old URL is revoked', () => {
    const { url, image } = createImageWithObjectUrl();
    image.src = 'https://example.com/image.png';
    ImageUrl.revokeObjectURL(url);
    expect(image.src).toBe('https://example.com/image.png');
    expect(readImageObjectUrlBlob(image)).toBeUndefined();
  });
});
