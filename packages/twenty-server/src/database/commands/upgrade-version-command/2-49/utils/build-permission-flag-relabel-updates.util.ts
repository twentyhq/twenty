import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';

type PermissionFlagPresentation = Pick<
  FlatPermissionFlag,
  'label' | 'description' | 'icon'
>;

type PermissionFlagRelabel = {
  universalIdentifier: string;
  previous: PermissionFlagPresentation;
  next: PermissionFlagPresentation;
};

const PERMISSION_FLAG_RELABELS: PermissionFlagRelabel[] = [
  {
    universalIdentifier: SystemPermissionFlag.APPLICATIONS,
    previous: {
      label: 'Applications',
      description: 'Install and manage applications',
      icon: 'IconApps',
    },
    next: {
      label: 'Workspace Apps',
      description: 'Install and manage workspace apps',
      icon: 'IconApps',
    },
  },
  {
    universalIdentifier: SystemPermissionFlag.CONNECTED_ACCOUNTS,
    previous: {
      label: 'Sync Account',
      description: 'Sync email and calendar accounts',
      icon: 'IconAt',
    },
    next: {
      label: 'User Apps',
      description: 'Manage own app preferences and accounts',
      icon: 'IconApps',
    },
  },
];

export const buildPermissionFlagRelabelUpdates = ({
  flatPermissionFlagsByUniversalIdentifier,
  now,
  direction,
}: {
  flatPermissionFlagsByUniversalIdentifier: Record<
    string,
    FlatPermissionFlag | undefined
  >;
  now: string;
  direction: 'up' | 'down';
}): FlatPermissionFlag[] =>
  PERMISSION_FLAG_RELABELS.flatMap(({ universalIdentifier, previous, next }) => {
    const permissionFlag =
      flatPermissionFlagsByUniversalIdentifier[universalIdentifier];

    if (
      !isDefined(permissionFlag) ||
      permissionFlag.applicationUniversalIdentifier !==
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      return [];
    }

    const target = direction === 'up' ? next : previous;

    if (
      permissionFlag.label === target.label &&
      permissionFlag.description === target.description &&
      permissionFlag.icon === target.icon
    ) {
      return [];
    }

    return [{ ...permissionFlag, ...target, updatedAt: now }];
  });
