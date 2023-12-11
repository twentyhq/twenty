const globalCoverage = {
  "statements": 60,
  "lines": 60,
  "functions": 60,
  "exclude": [
    "src/generated/**/*",
  ]
};

const modulesCoverage = {
  "statements": 50,
  "lines": 50,
  "functions": 45,
  "include": [
    "src/modules/**/*",
  ]
};

const pagesCoverage = {
  "statements": 50,
  "lines": 50,
  "functions": 45,
  "exclude": [
    "src/generated/**/*",
    "src/modules/**/*",
  ]
};

const storybookStoriesFolders = process.env.STORYBOOK_SCOPE;

module.exports = storybookStoriesFolders === 'pages' 
  ? pagesCoverage 
  : storybookStoriesFolders === 'modules' 
    ? modulesCoverage
    : globalCoverage;
