import { AppPath } from 'twenty-shared/types';

const getIndexAppPath = () => {
  return AppPath.Index;
};

// This file is using the default export pattern to be compatible
// with the way it is imported in the tests.
// Otherwise we cannot mock it: https://github.com/jestjs/jest/issues/12145 as we are using ES native modules
// TBH: I am not a big fan of this pattern, alternatively we could set a global variable or a recoilState
// to store the value
export default { getIndexAppPath };
