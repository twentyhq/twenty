import { createContext, useContext } from 'react';
import { Role } from '~/generated/graphql';

export type PermissionContextType = {
  currentRole: Role | null,
  objectNamePlural: string,
  hasPermission: (actions: string[], tableName?: string) => boolean
};

export const PermissionContext = createContext<PermissionContextType>(
  {} as PermissionContextType,
);

export const usePermissions = () => useContext(PermissionContext);
