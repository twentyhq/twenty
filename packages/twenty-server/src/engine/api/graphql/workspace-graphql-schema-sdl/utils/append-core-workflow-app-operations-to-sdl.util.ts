const CORE_WORKFLOW_APP_OPERATIONS_SDL = /* GraphQL */ `
  enum CoreWorkflowFilterFieldKey {
    NAME
    STATUSES
    UPDATED_AT
  }

  enum CoreWorkflowFilterOperand {
    CONTAINS
    DOES_NOT_CONTAIN
    IS
    IS_NOT
    IS_EMPTY
    IS_NOT_EMPTY
    IS_BEFORE
    IS_AFTER
    IS_IN_PAST
    IS_IN_FUTURE
    IS_TODAY
    IS_RELATIVE
  }

  enum CoreWorkflowFilterLogicalOperator {
    AND
    OR
  }

  enum CoreWorkflowVersionStatus {
    DRAFT
    ACTIVE
    DEACTIVATED
    ARCHIVED
  }

  input CoreWorkflowFilterRuleInput {
    fieldKey: CoreWorkflowFilterFieldKey!
    operand: CoreWorkflowFilterOperand!
    value: String
    timezone: String
  }

  input CoreWorkflowFilterInput {
    logicalOperator: CoreWorkflowFilterLogicalOperator!
    rules: [CoreWorkflowFilterRuleInput!]!
  }

  input CreateCoreWorkflowInput {
    name: String
  }

  input UpdateCoreWorkflowVersionTriggerInput {
    coreWorkflowVersionId: UUID!
    trigger: JSON!
  }

  input CreateCoreWorkflowVersionStepInput {
    coreWorkflowVersionId: UUID!
    stepType: String!
    parentStepId: String
    nextStepId: UUID
    id: String
    defaultSettings: JSON
  }

  input UpdateCoreWorkflowVersionStepInput {
    coreWorkflowVersionId: UUID!
    step: JSON!
  }

  type CoreWorkflowDTO {
    id: UUID!
    name: String
  }

  type CoreWorkflowEdgeDTO {
    node: CoreWorkflowDTO!
    cursor: String!
  }

  type CoreWorkflowPageInfoDTO {
    endCursor: String
    hasNextPage: Boolean!
  }

  type CoreWorkflowConnectionDTO {
    edges: [CoreWorkflowEdgeDTO!]!
    pageInfo: CoreWorkflowPageInfoDTO!
    totalCount: Int!
  }

  type CoreWorkflowVersionDTO {
    id: UUID!
    status: CoreWorkflowVersionStatus!
  }

  type WorkflowVersionTriggerDTO {
    trigger: JSON
  }

  type WorkflowVersionStepChangesDTO {
    triggerDiff: JSON
    stepsDiff: JSON
  }

  type WorkflowActionDTO {
    id: UUID!
  }

  extend type Query {
    coreWorkflows(
      first: Int
      after: String
      filter: CoreWorkflowFilterInput
    ): CoreWorkflowConnectionDTO!
    coreWorkflowVersionsByCoreWorkflowId(
      coreWorkflowId: UUID!
    ): [CoreWorkflowVersionDTO!]!
  }

  extend type Mutation {
    createCoreWorkflow(input: CreateCoreWorkflowInput!): CoreWorkflowDTO
    updateCoreWorkflowVersionTrigger(
      input: UpdateCoreWorkflowVersionTriggerInput!
    ): WorkflowVersionTriggerDTO!
    createCoreWorkflowVersionStep(
      input: CreateCoreWorkflowVersionStepInput!
    ): WorkflowVersionStepChangesDTO!
    updateCoreWorkflowVersionStep(
      input: UpdateCoreWorkflowVersionStepInput!
    ): WorkflowActionDTO!
    activateCoreWorkflowVersion(coreWorkflowVersionId: UUID!): Boolean!
  }
`;

export const appendCoreWorkflowAppOperationsToSdl = (
  baseSdl: string,
): string => {
  const scalarDeclarations = ['UUID', 'JSON']
    .filter(
      (scalarName) => !new RegExp(`scalar ${scalarName}\\b`).test(baseSdl),
    )
    .map((scalarName) => `scalar ${scalarName}`)
    .join('\n');

  return [scalarDeclarations, baseSdl, CORE_WORKFLOW_APP_OPERATIONS_SDL]
    .filter((part) => part.length > 0)
    .join('\n');
};
