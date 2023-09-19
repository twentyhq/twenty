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
  "statements": 55,
  "lines": 55,
  "functions": 55,
  "exclude": [
    "src/generated/**/*",
    "src/modules/**/*",
  ]
};

const storybookStoriesFolders = process.env.STORYBOOK_STORIES_FOLDER;

module.exports = storybookStoriesFolders === 'pages' ?
  pagesCoverage : storybookStoriesFolders === 'modules' ? modulesCoverage
  : globalCoverage;