import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    {
      [`${import.meta.env.VITE_SERVER_BASE_URL}/graphql`]: {
        // some of the mutations and queries require authorization (people or companies)
        // so to regenerate the schema with types we need to pass an auth token
        headers: {
          Authorization: `Bearer ${import.meta.env.AUTH_TOKEN}`,
        },
      },
    },
  ],
  overwrite: true,
  documents: ['./src/**/*.ts', '!src/generated/**/*.*'],
  generates: {
    './src/generated/graphql.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        skipTypename: true,
        withHooks: true,
        withHOC: false,
        withComponent: false,
      },
    },
  },
};

export default config;
