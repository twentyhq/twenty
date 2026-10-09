import { type MessageDescriptor } from '@lingui/core';

export type NativeAccountAppPermission = {
  label: MessageDescriptor;
  scopes: string[];
};
