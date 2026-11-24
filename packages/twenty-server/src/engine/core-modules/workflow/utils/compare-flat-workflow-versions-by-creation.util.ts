import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

export const compareFlatWorkflowVersionsByCreation = (
  firstFlatWorkflowVersion: Pick<FlatWorkflowVersion, 'createdAt' | 'id'>,
  secondFlatWorkflowVersion: Pick<FlatWorkflowVersion, 'createdAt' | 'id'>,
): number =>
  Date.parse(firstFlatWorkflowVersion.createdAt) -
    Date.parse(secondFlatWorkflowVersion.createdAt) ||
  firstFlatWorkflowVersion.id.localeCompare(secondFlatWorkflowVersion.id);
