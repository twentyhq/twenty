import { Permission, PermissionWithoutId } from "@/settings/roles/types/Permission";
import { UserWorkspace } from "~/generated/graphql";

  
  export type Role = {
    id: string;
    icon: string;
    name: string;
    description: string;
    canAccessWorkspaceSettings: boolean;
    isActive: boolean;
    isCustom: boolean;
    createdAt: string; // ISO format
    updatedAt: string; // ISO format
    permissions: Permission[];
    reportsTo?: Role;
    workspace: {
      id: string;
      displayName: string;
    };
    users: UserWorkspace[]
  };
  
  export interface CreateRoleInput {
    icon: string;
    name: string;
    description?: string;
    canAccessWorkspaceSettings: boolean;
    permissions: PermissionWithoutId[];
    workspaceId: string;
    reportsTo?: Role;
  }
  
  export interface UpdateRoleInput extends CreateRoleInput {
    id: string;
    workspaceId: string;
  }
  