import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityPathSubject } from '@/conditional-availability/types/ConditionalAvailabilityPathSubject';
import { type ConditionalAvailabilityRowSubject } from '@/conditional-availability/types/ConditionalAvailabilityRowSubject';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';
import { type GetConditionalAvailabilityRolesQuery } from '~/generated-metadata/graphql';

export type ConditionalAvailabilityEditorContextValue = {
  itemKey: string;
  isReadOnly: boolean;
  availableSubjects: ConditionalAvailabilityPathSubject[];
  hasRolesPermission: boolean;
  roles: GetConditionalAvailabilityRolesQuery['getRoles'];
  isLoadingRoles: boolean;
  addRow: (groupId: string | null) => void;
  addGroup: () => void;
  removeNode: (nodeId: string) => void;
  setLogicalOperator: (parameters: {
    groupId: string | null;
    logicalOperator: ConditionalAvailabilityLogicalOperator;
  }) => void;
  changeRowSubject: (parameters: {
    rowId: string;
    rowSubject: ConditionalAvailabilityRowSubject;
  }) => void;
  changeRowOperator: (parameters: {
    rowId: string;
    operator: ConditionalAvailabilityOperator;
  }) => void;
  changeRowValues: (parameters: { rowId: string; values: string[] }) => void;
};
