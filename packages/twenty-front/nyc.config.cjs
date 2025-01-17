// @ts-check
const globalCoverage = {
  branches: 23,
  statements: 39,
  lines: 39,
  functions: 28,
  exclude: ['src/generated/**/*'],
};

const modulesCoverage = {
  branches: 25,
  statements: 44,
  lines: 45,
  functions: 38,
  include: ['src/modules/**/*'],
  exclude: ['src/**/*.ts'],
};

const pagesCoverage = {
  branches: 35,
  statements: 60,
  lines: 60,
  functions: 45,
  exclude: ['src/generated/**/*', 'src/modules/**/*', 'src/**/*.ts'],
};

const performanceCoverage = {
  branches: 35,
  statements: 60,
  lines: 60,
  functions: 45,
  exclude: ['src/generated/**/*', 'src/modules/**/*', 'src/**/*.ts'],
};

const getCoverageConfig = () => {
  const storybookStoriesFolders = process.env.STORYBOOK_SCOPE;
  switch (storybookStoriesFolders) {
    case 'pages':
      return pagesCoverage;
    case 'modules':
      return modulesCoverage;
    case 'performance':
      return performanceCoverage;
    default:
      return globalCoverage;
  }
};

module.exports = getCoverageConfig();
