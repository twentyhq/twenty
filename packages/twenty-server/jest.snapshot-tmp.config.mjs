import base from './jest.config.mjs';

export default {
  ...base,
  moduleNameMapper: {
    '^twenty-shared/(.*)$': '<rootDir>/../twenty-shared/src/$1',
    '^@/(.*)$': '<rootDir>/../twenty-shared/src/$1',
    ...base.moduleNameMapper,
  },
};
