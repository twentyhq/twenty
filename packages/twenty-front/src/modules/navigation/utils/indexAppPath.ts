import { AppPath } from '@/types/AppPath';

const getIndexAppPath = () => {
  return AppPath.Index;
};

// This file is using the default export pattern to be compatible
// with the way it is imported in the tests.
// Otherwise we cannot mock it: https://github.com/jestjs/jest/issues/12145 as we are using ES native modules
export default { getIndexAppPath };
