import axios from 'axios';
import { useEffect, useState } from 'react';

export type RoleItem = {
  id: number;
  icon: string;
  name: string;
  description: string;
  isCustom: boolean;
  isRemote: boolean; // Default: false
  archived: boolean;
  usersId: number; // Total number of people in this role
  // reportsTo: ; // User X
  // assignRecordsTo: ; // All members, Members of the same level, Direct subordinate members
  // accessWorkspace: ; // Yes, No [True, False]
  // copyPermissions: ; // Role X
  isSystem?: any;
  permissions?: Permissions[]; // arr - xyz function permissions table (for create, edit, view, delete)
};

export type Permissions = {
  type: 'create' | 'edit' | 'view' | 'delete';
  allowed: boolean;
};

const API_URL = 'https://66bd028a24da2de7ff6c7edd.mockapi.io/mock/role';

export const useMockRole = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<RoleItem[]>(API_URL);
      setRoles(response.data);
    } catch (err) {
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (role: Omit<RoleItem, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<RoleItem>(API_URL, role);
      setRoles((prevRoles) => [...prevRoles, response.data]);
    } catch (err) {
      setError('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: number, updatedRole: Partial<RoleItem>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put<RoleItem>(
        `${API_URL}/${id}`,
        updatedRole,
      );
      setRoles(roles.map((role) => (role.id === id ? response.data : role)));
    } catch (err) {
      setError('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setRoles(roles.filter((role) => role.id !== id));
    } catch (err) {
      setError('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const toggleArchived = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const roleToToggle = roles.find((role) => role.id === id);
      // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
      if (roleToToggle) {
        const updatedRole = {
          ...roleToToggle,
          archived: !roleToToggle.archived,
        };
        const response = await axios.put<RoleItem>(
          `${API_URL}/${id}`,
          updatedRole,
        );
        setRoles(roles.map((role) => (role.id === id ? response.data : role)));
      }
    } catch (err) {
      setError('Failed to toggle archived status');
    } finally {
      setLoading(false);
    }
  };

  const findRoleByName = (name: string): RoleItem | undefined => {
    return roles.find((role) => role.name === name);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    toggleArchived,
    findRoleByName,
  };
};
