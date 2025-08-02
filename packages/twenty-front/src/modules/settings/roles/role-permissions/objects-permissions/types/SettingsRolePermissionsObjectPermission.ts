import { ReactNode } from 'react';
import { ObjectPermission } from '~/generated/graphql';
export type SettingsRolePermissionsObjectPermission = {
  key: string;
  label: string | ReactNode;
  value?: boolean;
  setValue: (value: boolean) => void;
  grantedBy?: number;
  revokedBy?: number;
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
  setValue: (value: boolean | null) => void;
};
