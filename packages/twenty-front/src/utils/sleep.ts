export const sleep = async (
  ms: number,
  callback?: (resolve: (value: any) => void) => void,
) =>
  new Promise((resolve) => {
    const handler = callback
      ? (resolve: (value: any) => void) => callback(resolve)
      : resolve;
    setTimeout(handler, ms);
  });
