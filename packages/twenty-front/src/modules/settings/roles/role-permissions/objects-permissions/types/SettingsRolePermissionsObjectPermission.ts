import { type ReactNode } from 'react';
import { type ObjectPermission } from '~/generated/graphql';

export type SettingsRolePermissionsObjectPermission = {
  key: keyof Pick<
    ObjectPermission,
    | 'canDestroyObjectRecords'
    | 'canReadObjectRecords'
    | 'canSoftDeleteObjectRecords'
    | 'canUpdateObjectRecords'
  >;
  label: string | ReactNode;
  value?: boolean;
  grantedBy?: number;
  revokedBy?: number;
  setValue: (newValue: boolean) => void;
};

export type SettingsRolePermissionsObjectLevelPermission = {
  key: keyof Pick<
    ObjectPermission,
    | 'canDestroyObjectRecords'
    | 'canReadObjectRecords'
    | 'canSoftDeleteObjectRecords'
    | 'canUpdateObjectRecords'
  >;
  label: string | ReactNode;
  value?: boolean | null;
};
