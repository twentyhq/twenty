import * as twenty from 'twenty-sdk/cli';

const main = async () => {
  await twenty.appTypecheck({
    appPath: './',
  });
};
