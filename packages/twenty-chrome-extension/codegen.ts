import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [{
    [`${import.meta.env.VITE_SERVER_BASE_URL}/graphql`]: {
      // some of the mutations and queries require authorization (people or companies)
      // so to regenrate the schema with types we need to pass a auth token
      headers: {
        Authorization: 'YOUR-TOKEN-HERE',
      },
    }
  }],
  overwrite: true,
  documents: ['./src/**/*.ts', '!src/generated/**/*.*' ],
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
