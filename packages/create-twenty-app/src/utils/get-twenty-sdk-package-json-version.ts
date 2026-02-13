export const getTwentySdkPackageJsonVersion = () => {
  return require('../../package.json').version; // We take the create twenty app version because it should always matches with the twenty-sdk version
};
