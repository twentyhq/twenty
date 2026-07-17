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
  [personName, workspaceMemberName, displayName, handle].find(
    isNonEmptyString,
  ) ?? 'Unknown';
