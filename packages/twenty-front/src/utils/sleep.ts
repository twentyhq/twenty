export const sleep = async (
  ms: number,
  callback?: (resolve: (value: any) => void) => void,
) =>
  new Promise((resolve) => {
    const handler = callback ? () => callback(resolve) : resolve;
    setTimeout(handler, ms);
  });
