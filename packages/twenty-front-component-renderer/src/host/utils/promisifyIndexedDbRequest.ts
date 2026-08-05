export const promisifyIndexedDbRequest = <TResult>(
  request: IDBRequest<TResult>,
): Promise<TResult> =>
  new Promise<TResult>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
