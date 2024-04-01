const globalCoverage = {
  statements: 60,
  lines: 60,
  functions: 60,
  exclude: ['src/generated/**/*'],
};

const modulesCoverage = {
  statements: 75,
  lines: 75,
  functions: 70,
  include: ['src/modules/**/*'],
  exclude: ['src/**/*.ts'],
};

const pagesCoverage = {
  statements: 55,
  lines: 55,
  functions: 45,
  exclude: ['src/generated/**/*', 'src/modules/**/*', 'src/**/*.ts'],
};

const storybookStoriesFolders = process.env.STORYBOOK_SCOPE;

module.exports =
  storybookStoriesFolders === 'pages'
    ? pagesCoverage
    : storybookStoriesFolders === 'modules'
      ? modulesCoverage
      : globalCoverage;
