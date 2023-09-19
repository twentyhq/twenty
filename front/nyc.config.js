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

module.exports = process.env.STORYBOOK_STORIES_FOLDER === 'modules' ? modulesCoverage : pagesCoverage;