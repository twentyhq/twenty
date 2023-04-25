module.exports = {
  schema: [
    {
      'https://api.twenty.com/v1/graphql': {
        headers: {
          Authorization:
            'Bearer ' +
            'eyJhbGciOiJIUzI1NiJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLXdvcmtzcGFjZS1pZCI6IjIiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbIm1lIiwidXNlciJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtdXNlci1pZCI6IjU4NjdlMDBhLTY0MDUtNDY2Ni1hNDQzLTdhZTYzYWUzMDBlMiIsIngtaGFzdXJhLXVzZXItaXMtYW5vbnltb3VzIjoiZmFsc2UifSwic3ViIjoiNTg2N2UwMGEtNjQwNS00NjY2LWE0NDMtN2FlNjNhZTMwMGUyIiwiaWF0IjoxNjgyNDMzNTcxLCJleHAiOjE2ODI0MzQ0NzEsImlzcyI6Imhhc3VyYS1hdXRoIn0.qM1Fc1Sgb766UQ8Ez9_v6F9YOOKI1PTPq4NTscn9diM',
        },
      },
    },
  ],
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
    './graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
};
