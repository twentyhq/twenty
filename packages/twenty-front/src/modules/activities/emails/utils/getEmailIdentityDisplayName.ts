import { isNonEmptyString } from '@sniptt/guards';

export const getEmailIdentityDisplayName = ({
  personName,
  workspaceMemberName,
  displayName,
  handle,
}: {
  personName?: string;
  workspaceMemberName?: string;
  displayName?: string;
  handle?: string;
}): string =>
  [workspaceMemberName, personName, displayName, handle].find(
    isNonEmptyString,
  ) ?? 'Unknown';
