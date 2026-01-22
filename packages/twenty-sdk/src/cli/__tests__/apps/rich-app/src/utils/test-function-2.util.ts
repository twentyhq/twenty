export const testFunction2 = () => {
  const Twenty = require('../../generated').default;

  const client = new Twenty();

  return client.query('testQuery');
};
