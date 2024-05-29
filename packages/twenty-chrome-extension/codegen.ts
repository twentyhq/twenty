import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [`${import.meta.env.VITE_SERVER_BASE_URL}/graphql`],
  overwrite: false,
  documents: ['./src/**/*.ts', 
    '!src/generated/**/*.*', 
    '!src/graphql/company/*', 
    '!src/graphql/person/*'
  ],
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
