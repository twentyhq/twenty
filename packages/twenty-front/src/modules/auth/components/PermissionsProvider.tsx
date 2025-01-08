import { currentObjectNamePluralState } from '@/auth/states/currentObjectNamePlural';
import { currentRoleState, isReadyPermissionValidation } from '@/auth/states/currentRoleState';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { PermissionContext } from '../contexts/PermissionContext';



export const PermissionsProvider = ({ children }: React.PropsWithChildren) => {
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentUserRole = currentUser?.workspaces.find(userWorkspace => userWorkspace?.workspace?.id === currentWorkspace?.id)?.role;
  const setCurrentRole = useSetRecoilState(currentRoleState);
  const setCurrentObjectNamePlural = useSetRecoilState(currentObjectNamePluralState);
  const setIsReadyToValidatePermissions = useSetRecoilState(isReadyPermissionValidation);
  
  const currentRole = useRecoilValue(currentRoleState)
  
  const objectNamePlural = useParams().objectNamePlural ?? '';


  const hasPermission = ( actions: string[], tableName?: string) => {
    if(!currentUserRole?.permissions) return false;
    const objectName = tableName ? tableName : objectNamePlural
    const actualModulePermission = currentUserRole.permissions.find(perm => perm.tableName.toLowerCase() === objectName.toLowerCase())
    
    if(!actualModulePermission) return false;


    return actions.some((action) => {
      switch (action) {
        case 'create':
          return actualModulePermission.canCreate;
        case 'edit':
          return actualModulePermission.canEdit;
        case 'view':
          return actualModulePermission.canView;
        case 'delete':
          return actualModulePermission.canDelete;
        default:
          return false;
      }
    });
  };

  useEffect(() => {
    if(currentUser && currentUserRole){
      setCurrentRole(currentUserRole)
      setCurrentObjectNamePlural(objectNamePlural)
      setIsReadyToValidatePermissions(true)
    }
  }, [currentUser, objectNamePlural])


  return (
    <PermissionContext.Provider
      value={{
        currentRole,
        objectNamePlural,
        hasPermission
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
