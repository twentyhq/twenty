import { updateRemoteElementProperty } from '@remote-dom/core/elements';

import { IMAGE_OBJECT_URL_BLOB_PROPERTY } from '@/constants/ImageObjectUrlBlobProperty';

export const installImageObjectUrlPolyfill = ({
  urlConstructor,
  imageElementPrototype,
}: {
  urlConstructor: typeof URL;
  imageElementPrototype: object;
}): void => {
  const createObjectURL = urlConstructor.createObjectURL.bind(urlConstructor);
  const revokeObjectURL = urlConstructor.revokeObjectURL.bind(urlConstructor);
  const blobByObjectUrl = new Map<string, Blob>();
  const imageSources = new WeakMap<Element, string>();

  urlConstructor.createObjectURL = (blob) => {
    const url = createObjectURL(blob);
    if (blob instanceof Blob) {
      blobByObjectUrl.set(url, blob);
    }
    return url;
  };

  urlConstructor.revokeObjectURL = (url) => {
    blobByObjectUrl.delete(url);
    revokeObjectURL(url);
  };

  Object.defineProperty(imageElementPrototype, 'src', {
    configurable: true,
    get(this: Element) {
      return imageSources.get(this);
    },
    set(this: Element, src: string) {
      imageSources.set(this, src);
      updateRemoteElementProperty(
        this,
        IMAGE_OBJECT_URL_BLOB_PROPERTY,
        blobByObjectUrl.get(src),
      );
      updateRemoteElementProperty(this, 'src', src);
    },
  });
};
