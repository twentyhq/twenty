import { updateRemoteElementProperty } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

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
  const objectUrls = new Map<
    string,
    { blob: Blob; images: Set<WeakRef<Element>> }
  >();
  const imageReferences = new WeakMap<Element, WeakRef<Element>>();
  const imageSources = new WeakMap<Element, string>();

  urlConstructor.createObjectURL = (blob) => {
    const url = createObjectURL(blob);
    if (blob instanceof Blob) {
      objectUrls.set(url, { blob, images: new Set() });
    }
    return url;
  };

  urlConstructor.revokeObjectURL = (url) => {
    const registration = objectUrls.get(url);
    objectUrls.delete(url);

    for (const reference of registration?.images ?? []) {
      const image = reference.deref();
      if (isDefined(image)) {
        updateRemoteElementProperty(
          image,
          IMAGE_OBJECT_URL_BLOB_PROPERTY,
          undefined,
        );
      }
    }
    revokeObjectURL(url);
  };

  Object.defineProperty(imageElementPrototype, 'src', {
    configurable: true,
    get(this: Element) {
      return imageSources.get(this);
    },
    set(this: Element, src: string) {
      let reference = imageReferences.get(this);
      if (!isDefined(reference)) {
        reference = new WeakRef(this);
        imageReferences.set(this, reference);
      }
      const previousSrc = imageSources.get(this);
      if (isDefined(previousSrc)) {
        objectUrls.get(previousSrc)?.images.delete(reference);
      }
      const registration = objectUrls.get(src);
      registration?.images.add(reference);
      imageSources.set(this, src);
      updateRemoteElementProperty(
        this,
        IMAGE_OBJECT_URL_BLOB_PROPERTY,
        registration?.blob,
      );
      updateRemoteElementProperty(this, 'src', src);
    },
  });
};
