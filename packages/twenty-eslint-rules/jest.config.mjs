
export default {
  displayName: 'twenty-eslint-rules',
  silent: false,
  preset: '@nx/jest/preset',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/twenty-eslint-rules',
};
