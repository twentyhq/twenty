module.exports = {
  schema:
    (process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000') +
    '/metadata',
  documents: [
    './src/modules/databases/graphql/**/*.ts',
    './src/modules/object-metadata/graphql/*.ts',
    './src/modules/settings/serverless-functions/graphql/**/*.ts',
    './src/modules/object-record/graphql/*.tsx',
    './src/modules/metadata/graphql/*.ts',
  ],
  overwrite: true,
  generates: {
    './src/generated-metadata/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
};
