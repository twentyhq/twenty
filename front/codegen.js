module.exports = {
  schema: process.env.REACT_APP_API_URL,
  documents: ['./src/**/*.tsx', './src/**/*.ts'],
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
      },
    },
  },
};
