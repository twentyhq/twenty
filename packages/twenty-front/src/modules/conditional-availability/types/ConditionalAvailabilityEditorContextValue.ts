import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityRecordFieldOption } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldOption';
import { type ConditionalAvailabilityRowSubject } from '@/conditional-availability/types/ConditionalAvailabilityRowSubject';
import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';
import { type GetConditionalAvailabilityRolesQuery } from '~/generated-metadata/graphql';

export type ConditionalAvailabilityEditorContextValue = {
  itemKey: string;
  isReadOnly: boolean;
  availableSubjects: ConditionalAvailabilitySubject[];
  hasRolesPermission: boolean;
  roles: GetConditionalAvailabilityRolesQuery['getRoles'];
  isLoadingRoles: boolean;
  fields: FieldMetadataItem[];
  recordFieldOptions: ConditionalAvailabilityRecordFieldOption[];
  recordFieldSectionLabel: string | null;
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
  replaceWithRules: () => void;
};
