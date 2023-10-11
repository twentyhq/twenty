module.exports = {
  schema: process.env.REACT_APP_SERVER_BASE_URL + "/metadata",
  documents: ['./src/metadata/graphql/*.tsx', './src/metadata/graphql/*.ts'],
  overwrite: true,
  generates: {
    './src/generated-metadata/': {
      preset: 'client',
    },
  },
};
