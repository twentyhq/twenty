module.exports = {
  schema: process.env.REACT_APP_SERVER_BASE_URL + "/graphql",
  documents: ['!./src/modules/metadata/graphql/*.ts', '!./src/modules/metadata/graphql/*.tsx', './src/**/*.tsx', './src/**/*.ts'],
  overwrite: true,
  generates: {
    './src/generated/graphql.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        skipTypename: false,
        withHooks: true,
        withHOC: false,
        withComponent: false,
        scalars: {
          DateTime: 'string',
        }
      },
    },
  },
};
