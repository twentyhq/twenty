import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const OAUTH_SCOPE_LABELS: Record<string, MessageDescriptor | undefined> =
  {
    api: msg`Access your workspace data`,
    profile: msg`Read your profile`,
  };
