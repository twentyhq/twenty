module.exports = {
  schema: process.env.REACT_APP_SERVER_BASE_URL + "/graphql",
  documents: ['!./src/modules/metadata/**', './src/modules/**/*.tsx', './src/modules/**/*.ts'],
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
