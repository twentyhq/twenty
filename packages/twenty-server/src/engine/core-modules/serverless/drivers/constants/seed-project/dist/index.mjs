// packages/twenty-server/src/engine/core-modules/serverless/drivers/constants/seed-project/src/index.ts
var main = async (params) => {
  const { a, b } = params;
  const message = `Hello, input: ${a} and ${b}`;
  return { message };
};
export { main };
