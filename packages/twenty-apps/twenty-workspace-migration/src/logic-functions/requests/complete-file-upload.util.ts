import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";

// Must be called only after the byte PUT to the createFileUpload-issued uploadUrl has
// succeeded - the server verifies the object exists in storage (and its size matches) before
// flipping the upload's status, and throws otherwise.
export const completeFileUpload = async (
  client: AxiosInstance,
  fileId: string,
): Promise<{ id: string; path: string; url: string }> => {
  const mutation = `mutation completeFileUpload($fileId: String!) {
  completeFileUpload(fileId: $fileId) {
    id
    path
    url
  }
}`;

  const data = await postGraphql<{ completeFileUpload: { id: string; path: string; url: string } }>(
    client,
    '/graphql',
    'completeFileUpload',
    mutation,
    { fileId },
  );

  return data.completeFileUpload;
}
