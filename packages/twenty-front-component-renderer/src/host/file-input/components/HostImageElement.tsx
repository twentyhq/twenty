import React from 'react';

import { IMAGE_OBJECT_URL_BLOB_PROPERTY } from '@/constants/ImageObjectUrlBlobProperty';
import { useHtmlHostElementProps } from '@/host/elements/hooks/useHtmlHostElementProps';
import { createPlainHostElement } from '@/host/elements/utils/createPlainHostElement';
import { useImageObjectUrl } from '@/host/file-input/hooks/useImageObjectUrl';

type HostImageElementProps = { children?: React.ReactNode } & Record<
  string,
  unknown
>;

export const HostImageElement = ({
  [IMAGE_OBJECT_URL_BLOB_PROPERTY]: blob,
  children,
  ...props
}: HostImageElementProps) => {
  const { reactBindableProps, hostEnforcedProps, composedElementRef } =
    useHtmlHostElementProps({ props, htmlTag: 'img' });
  const objectUrl = useImageObjectUrl(blob);

  return createPlainHostElement({
    htmlTag: 'img',
    isVoid: true,
    reactBindableProps: {
      ...reactBindableProps,
      src: blob instanceof Blob ? objectUrl : reactBindableProps.src,
    },
    hostEnforcedProps,
    composedElementRef,
    children,
  });
};
