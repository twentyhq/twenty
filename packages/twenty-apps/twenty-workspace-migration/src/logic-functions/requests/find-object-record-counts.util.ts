import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";

const QUERY = `query findObjectRecordCounts {
  objectRecordCounts {
    objectNamePlural
    totalCount
  }
}`;

export const findObjectRecordCounts = async (client: AxiosInstance): Promise<Map<string, number>> => {
  const data = await postGraphql<{ objectRecordCounts: { objectNamePlural: string; totalCount: number }[] }>(
    client,
    '/metadata',
    'findObjectRecordCounts',
    QUERY,
  );

  return new Map(data.objectRecordCounts.map((entry) => [entry.objectNamePlural, entry.totalCount]));
}
