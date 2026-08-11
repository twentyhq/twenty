import React from 'react';

import { type ElementRefCallback } from '@/host/types/ElementRefCallback';

type CreatePlainHostElementParams = {
  htmlTag: string;
  isVoid: boolean;
  reactBindableProps: Record<string, unknown>;
  hostEnforcedProps: Record<string, unknown>;
  composedElementRef: ElementRefCallback;
  children: React.ReactNode;
};

export const createPlainHostElement = ({
  htmlTag,
  isVoid,
  reactBindableProps,
  hostEnforcedProps,
  composedElementRef,
  children,
}: CreatePlainHostElementParams) =>
  React.createElement(
    htmlTag,
    {
      ...reactBindableProps,
      ...hostEnforcedProps,
      ref: composedElementRef,
    },
    isVoid ? undefined : children,
  );
