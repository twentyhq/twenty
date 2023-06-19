import { Workspace as GQLWorkspace } from '../../../generated/graphql';
import { DeepPartial } from '../../utils/utils';

export type Workspace = DeepPartial<GQLWorkspace> & { id: GQLWorkspace['id'] };

export type GraphqlQueryWorkspace = Workspace;

export type GraphqlMutationWorkspace = Workspace;

export const mapToWorkspace = (
  workspace: GraphqlQueryWorkspace,
): Workspace => ({
  id: workspace.id,
  domainName: workspace.domainName,
  displayName: workspace.displayName,
  logo: workspace.logo,
});

export const mapToGqlWorkspace = (
  workspace: Workspace,
): GraphqlMutationWorkspace => workspace;
