import { WorkspaceMember as GQLWorkspaceMember } from '../../../generated/graphql';
import { DeepPartial } from '../../utils/utils';

export type WorkspaceMember = DeepPartial<GQLWorkspaceMember> & {
  id: GQLWorkspaceMember['id'];
};

export type GraphqlQueryWorkspaceMember = WorkspaceMember;

export type GraphqlMutationWorkspaceMember = WorkspaceMember;

export const mapToWorkspaceMember = (
  workspaceMember: GraphqlQueryWorkspaceMember,
): WorkspaceMember => workspaceMember;

export const mapToGqlWorkspaceMember = (
  workspaceMember: WorkspaceMember,
): GraphqlMutationWorkspaceMember => workspaceMember;
