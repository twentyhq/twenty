import { type AxiosInstance } from "axios";
import { FindInstalledApplicationsType } from "src/logic-functions/types/find-installed-applications.type";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";

export const findInstalledApplications = async (
  client: AxiosInstance,
): Promise<FindInstalledApplicationsType> => {
  const data = await postGraphql<FindInstalledApplicationsType['data']>(
    client,
    '/metadata',
    'findInstalledApplications',
    'query findInstalledApplications { findManyApplications { universalIdentifier name canBeUninstalled version applicationRegistration { sourceType } } }',
  );

  return { data };
}
