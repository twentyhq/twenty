import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
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
    universalIdentifier: '9faa55f7-2606-566b-9e1d-aefbedbd0136',
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
    universalIdentifier: 'e5f63b2d-5369-5df6-8f32-a8bd9e79e653',
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
