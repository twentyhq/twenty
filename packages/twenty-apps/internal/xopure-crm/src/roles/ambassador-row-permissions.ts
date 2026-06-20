import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { AMBASSADOR_MANAGER_WORKSPACE_MEMBER_FIELD_ID } from '../fields/ambassador-manager-workspace-member.field';
import { AMBASSADOR_WORKSPACE_MEMBER_FIELD_ID } from '../fields/ambassador-workspace-member.field';
import { COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/commission-assigned-ambassador.field';
import { COMMISSION_SUPERVISOR_FIELD_ID } from '../fields/commission-supervisor.field';
import { CUSTOMER_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/customer-assigned-ambassador.field';
import { CUSTOMER_SUPERVISOR_FIELD_ID } from '../fields/customer-supervisor.field';
import { ENRICHMENT_TASK_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/enrichment-task-assigned-ambassador.field';
import { ENRICHMENT_TASK_SUPERVISOR_FIELD_ID } from '../fields/enrichment-task-supervisor.field';
import { INFLUENCER_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/influencer-prospect-assigned-ambassador.field';
import { INFLUENCER_PROSPECT_SUPERVISOR_FIELD_ID } from '../fields/influencer-prospect-supervisor.field';
import { ORDER_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/order-assigned-ambassador.field';
import { ORDER_SUPERVISOR_FIELD_ID } from '../fields/order-supervisor.field';
import { PERSON_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/person-assigned-ambassador.field';
import { PERSON_SUPERVISOR_FIELD_ID } from '../fields/person-supervisor.field';
import { RETAIL_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/retail-prospect-assigned-ambassador.field';
import { RETAIL_PROSPECT_SUPERVISOR_FIELD_ID } from '../fields/retail-prospect-supervisor.field';
import { ENRICHMENT_TASK_OBJECT_ID } from '../objects/enrichment-task.object';
import { INFLUENCER_PROSPECT_OBJECT_ID } from '../objects/influencer-prospect.object';
import { RETAIL_PROSPECT_OBJECT_ID } from '../objects/retail-prospect.object';
import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { XOPURE_COMMISSION_OBJECT_ID } from '../objects/xopure-commission.object';
import { XOPURE_CUSTOMER_OBJECT_ID } from '../objects/xopure-customer.object';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';

// Local structural types — twenty-sdk/define does not export row-level permission types.
// When the SDK catches up, these should be replaced with the canonical imports.
type RowLevelPermissionPredicateConfig = {
  objectUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  operand: string;
  value: { isCurrentWorkspaceMemberSelected: boolean; selectedRecordIds: string[] };
  rowLevelPermissionPredicateGroupUniversalIdentifier?: string;
  positionInRowLevelPermissionPredicateGroup?: number;
};

type RowLevelPermissionPredicateGroupConfig = {
  universalIdentifier: string;
  objectUniversalIdentifier: string;
  logicalOperator: string;
};

type ObjectPermissionConfig = {
  objectUniversalIdentifier: string;
  canReadObjectRecords: boolean;
  canUpdateObjectRecords: boolean;
  canSoftDeleteObjectRecords: boolean;
  canDestroyObjectRecords: boolean;
};

type FieldPermissionConfig = {
  objectUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  canReadFieldValue: boolean;
  canUpdateFieldValue: boolean;
};

type AmbassadorRestrictedObject = {
  objectUniversalIdentifier: string;
  assignedFieldUniversalIdentifier: string;
  supervisorFieldUniversalIdentifier: string;
  managerPredicateGroupUniversalIdentifier: string;
};

const currentWorkspaceMemberRelationValue = {
  isCurrentWorkspaceMemberSelected: true,
  selectedRecordIds: [],
};

const ROW_LEVEL_PERMISSION_PREDICATE_OPERAND_IS = 'IS';
const ROW_LEVEL_PERMISSION_PREDICATE_GROUP_LOGICAL_OPERATOR_OR = 'OR';

const AMBASSADOR_RESTRICTED_OBJECTS: AmbassadorRestrictedObject[] = [
  {
    objectUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
    assignedFieldUniversalIdentifier: AMBASSADOR_WORKSPACE_MEMBER_FIELD_ID,
    supervisorFieldUniversalIdentifier:
      AMBASSADOR_MANAGER_WORKSPACE_MEMBER_FIELD_ID,
    managerPredicateGroupUniversalIdentifier:
      '189933e2-fcb9-5dea-b523-3e0dbad67cc0',
  },
  {
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
    assignedFieldUniversalIdentifier: PERSON_ASSIGNED_AMBASSADOR_FIELD_ID,
    supervisorFieldUniversalIdentifier: PERSON_SUPERVISOR_FIELD_ID,
    managerPredicateGroupUniversalIdentifier:
      '2cd35c20-5bc0-5460-8059-125ac24ed59f',
  },
  {
    objectUniversalIdentifier: XOPURE_CUSTOMER_OBJECT_ID,
    assignedFieldUniversalIdentifier: CUSTOMER_ASSIGNED_AMBASSADOR_FIELD_ID,
    supervisorFieldUniversalIdentifier: CUSTOMER_SUPERVISOR_FIELD_ID,
    managerPredicateGroupUniversalIdentifier:
      'faed88f0-6b7e-5443-b28b-2ba387ff1c9e',
  },
  {
    objectUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
    assignedFieldUniversalIdentifier: ORDER_ASSIGNED_AMBASSADOR_FIELD_ID,
    supervisorFieldUniversalIdentifier: ORDER_SUPERVISOR_FIELD_ID,
    managerPredicateGroupUniversalIdentifier:
      '671a6c28-f142-5cb9-9746-b9f8245c306b',
  },
  {
    objectUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
    assignedFieldUniversalIdentifier: COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID,
    supervisorFieldUniversalIdentifier: COMMISSION_SUPERVISOR_FIELD_ID,
    managerPredicateGroupUniversalIdentifier:
      '02762feb-414e-57f2-83d7-2436fe859007',
  },
  {
    objectUniversalIdentifier: RETAIL_PROSPECT_OBJECT_ID,
    assignedFieldUniversalIdentifier:
      RETAIL_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID,
    supervisorFieldUniversalIdentifier: RETAIL_PROSPECT_SUPERVISOR_FIELD_ID,
    managerPredicateGroupUniversalIdentifier:
      '885677f3-ede2-5636-9e82-1d3ebc28df06',
  },
  {
    objectUniversalIdentifier: INFLUENCER_PROSPECT_OBJECT_ID,
    assignedFieldUniversalIdentifier:
      INFLUENCER_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID,
    supervisorFieldUniversalIdentifier: INFLUENCER_PROSPECT_SUPERVISOR_FIELD_ID,
    managerPredicateGroupUniversalIdentifier:
      'c7ff5c17-367b-53d3-b608-64ab569e8391',
  },
  {
    objectUniversalIdentifier: ENRICHMENT_TASK_OBJECT_ID,
    assignedFieldUniversalIdentifier:
      ENRICHMENT_TASK_ASSIGNED_AMBASSADOR_FIELD_ID,
    supervisorFieldUniversalIdentifier: ENRICHMENT_TASK_SUPERVISOR_FIELD_ID,
    managerPredicateGroupUniversalIdentifier:
      '19aab25e-050b-5b99-add8-dd5560820344',
  },
];

export const AMBASSADOR_OBJECT_PERMISSIONS: ObjectPermissionConfig[] =
  AMBASSADOR_RESTRICTED_OBJECTS.map(({ objectUniversalIdentifier }) => ({
    objectUniversalIdentifier,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  }));

export const AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS: FieldPermissionConfig[] =
  AMBASSADOR_RESTRICTED_OBJECTS.flatMap(
    ({
      objectUniversalIdentifier,
      assignedFieldUniversalIdentifier,
      supervisorFieldUniversalIdentifier,
    }) => [
      {
        objectUniversalIdentifier,
        fieldUniversalIdentifier: assignedFieldUniversalIdentifier,
        canReadFieldValue: true,
        canUpdateFieldValue: false,
      },
      {
        objectUniversalIdentifier,
        fieldUniversalIdentifier: supervisorFieldUniversalIdentifier,
        canReadFieldValue: true,
        canUpdateFieldValue: false,
      },
    ],
  );

const buildCurrentWorkspaceMemberPredicate = ({
  objectUniversalIdentifier,
  fieldUniversalIdentifier,
  rowLevelPermissionPredicateGroupUniversalIdentifier,
  positionInRowLevelPermissionPredicateGroup,
}: {
  objectUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  rowLevelPermissionPredicateGroupUniversalIdentifier?: string;
  positionInRowLevelPermissionPredicateGroup?: number;
}): RowLevelPermissionPredicateConfig => ({
  objectUniversalIdentifier,
  fieldUniversalIdentifier,
  operand: ROW_LEVEL_PERMISSION_PREDICATE_OPERAND_IS,
  value: currentWorkspaceMemberRelationValue,
  rowLevelPermissionPredicateGroupUniversalIdentifier,
  positionInRowLevelPermissionPredicateGroup,
});

export const AMBASSADOR_REP_ROW_LEVEL_PERMISSION_PREDICATES: RowLevelPermissionPredicateConfig[] =
  AMBASSADOR_RESTRICTED_OBJECTS.map(
    ({ objectUniversalIdentifier, assignedFieldUniversalIdentifier }) =>
      buildCurrentWorkspaceMemberPredicate({
        objectUniversalIdentifier,
        fieldUniversalIdentifier: assignedFieldUniversalIdentifier,
      }),
  );

export const AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATE_GROUPS: RowLevelPermissionPredicateGroupConfig[] =
  AMBASSADOR_RESTRICTED_OBJECTS.map(
    ({
      objectUniversalIdentifier,
      managerPredicateGroupUniversalIdentifier,
    }) => ({
      universalIdentifier: managerPredicateGroupUniversalIdentifier,
      objectUniversalIdentifier,
      logicalOperator: ROW_LEVEL_PERMISSION_PREDICATE_GROUP_LOGICAL_OPERATOR_OR,
    }),
  );

export const AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATES: RowLevelPermissionPredicateConfig[] =
  AMBASSADOR_RESTRICTED_OBJECTS.flatMap(
    ({
      objectUniversalIdentifier,
      assignedFieldUniversalIdentifier,
      supervisorFieldUniversalIdentifier,
      managerPredicateGroupUniversalIdentifier,
    }) => [
      buildCurrentWorkspaceMemberPredicate({
        objectUniversalIdentifier,
        fieldUniversalIdentifier: assignedFieldUniversalIdentifier,
        rowLevelPermissionPredicateGroupUniversalIdentifier:
          managerPredicateGroupUniversalIdentifier,
        positionInRowLevelPermissionPredicateGroup: 0,
      }),
      buildCurrentWorkspaceMemberPredicate({
        objectUniversalIdentifier,
        fieldUniversalIdentifier: supervisorFieldUniversalIdentifier,
        rowLevelPermissionPredicateGroupUniversalIdentifier:
          managerPredicateGroupUniversalIdentifier,
        positionInRowLevelPermissionPredicateGroup: 1,
      }),
    ],
  );
