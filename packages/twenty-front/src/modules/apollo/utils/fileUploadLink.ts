import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { ApolloLink, Observable } from '@apollo/client';

export const fileUploadLink = new ApolloLink((operation, forward) => {
  const isFileUpload = operation.query.definitions.some(
    (def: any) =>
      def.kind === 'OperationDefinition' &&
      def.operation === 'mutation' &&
      def.selectionSet.selections.some((sel: any) =>
        sel.directives?.some((dir: any) =>
          dir.arguments?.some(
            (arg: any) =>
              arg.name.value === 'path' &&
              arg.value.value === '/agent-chat/files',
          ),
        ),
      ),
  );

  if (!isFileUpload) {
    return forward(operation);
  }

  return new Observable((observer) => {
    const file = operation.getContext().file;

    if (!file || !(file instanceof File)) {
      observer.error(new Error('File is required for file upload operations'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch(`${REST_API_BASE_URL}/agent-chat/files`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${getTokenPair()?.accessToken.token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        const result = await response.json();
        observer.next({ data: result });
        observer.complete();
      })
      .catch((error) => {
        observer.error(error);
      });
  });
});
