export type Permission = {
    id: string;
    canCreate: boolean;
    canDelete: boolean;
    canEdit: boolean;
    canView: boolean;
    tableName: string;
  };
  
  export type PermissionWithoutId = Omit<Permission, 'id'>;
  