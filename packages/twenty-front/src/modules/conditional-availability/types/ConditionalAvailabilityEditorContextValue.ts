import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityRowSubject } from '@/conditional-availability/types/ConditionalAvailabilityRowSubject';
import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';
import { type GetConditionalAvailabilityRolesQuery } from '~/generated-metadata/graphql';

export type ConditionalAvailabilityEditorContextValue = {
  itemKey: string;
  isReadOnly: boolean;
  availableSubjects: ConditionalAvailabilitySubject[];
  hasRolesPermission: boolean;
  roles: GetConditionalAvailabilityRolesQuery['getRoles'];
  isLoadingRoles: boolean;
  addRow: (groupId: string | null) => void;
  addGroup: () => void;
  removeNode: (nodeId: string) => void;
  setLogicalOperator: (
    groupId: string | null,
    logicalOperator: ConditionalAvailabilityLogicalOperator,
  ) => void;
  changeRowSubject: (
    rowId: string,
    rowSubject: ConditionalAvailabilityRowSubject,
  ) => void;
  changeRowOperator: (
    rowId: string,
    operator: ConditionalAvailabilityOperator,
  ) => void;
  changeRowValues: (rowId: string, values: string[]) => void;
};
