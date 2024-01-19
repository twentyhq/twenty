module.exports = {
  apps: [
    {
      name: 'server',
      script: 'yarn nx start:dev twenty-server',
    },
    {
      name: 'front',
      script: 'yarn nx start twenty-front',
    },
  ],
};
