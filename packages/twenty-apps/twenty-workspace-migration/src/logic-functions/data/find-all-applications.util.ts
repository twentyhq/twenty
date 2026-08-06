import { MetadataApiClient } from "twenty-client-sdk/metadata";

export const findAllApplications = async (client: MetadataApiClient) => {
  return await client.query({
    findManyApplications: {
      id: true
    }
  })
}