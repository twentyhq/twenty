import { type AxiosInstance } from "axios";
import { FindMarketplaceAppsType } from "src/logic-functions/types/find-marketplace-apps.type";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";

export const FindMarketplaceApps = async (
  client: AxiosInstance,
): Promise<FindMarketplaceAppsType> => {
  const data = await postGraphql<FindMarketplaceAppsType['data']>(
    client,
    '/metadata',
    'findMarketplaceApplications',
    'query findMarketplaceApplications { findManyMarketplaceApps { id name isVetted } }',
  );

  return { data };
}