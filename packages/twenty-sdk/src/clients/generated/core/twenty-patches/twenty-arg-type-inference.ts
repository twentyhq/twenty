// Twenty-specific convention-based GraphQL argument type inference.
// Derives GraphQL variable types from resolver naming patterns
// (e.g. createCompany → CompanyCreateInput!) so the core client
// works without a genql-generated type map.

type ResolverPattern = {
  regex: RegExp;
  getArgType: (objectName: string, argName: string) => string | null;
};

const RESOLVER_PATTERNS: ResolverPattern[] = [
  {
    regex: /^create(.+)$/,
    getArgType: (objectName, argName) => {
      if (argName === 'data') return `${objectName}CreateInput!`;
      if (argName === 'upsert') return 'Boolean';
      return null;
    },
  },
  {
    regex: /^update(.+)$/,
    getArgType: (objectName, argName) => {
      if (argName === 'id') return 'UUID!';
      if (argName === 'data') return `${objectName}UpdateInput!`;
      if (argName === 'filter') return `${objectName}FilterInput!`;
      return null;
    },
  },
  {
    regex: /^delete(.+)$/,
    getArgType: (objectName, argName) => {
      if (argName === 'id') return 'UUID!';
      if (argName === 'filter') return `${objectName}FilterInput!`;
      return null;
    },
  },
  {
    regex: /^destroy(.+)$/,
    getArgType: (objectName, argName) => {
      if (argName === 'id') return 'UUID!';
      if (argName === 'filter') return `${objectName}FilterInput!`;
      return null;
    },
  },
  {
    regex: /^restore(.+)$/,
    getArgType: (objectName, argName) => {
      if (argName === 'id') return 'UUID!';
      if (argName === 'filter') return `${objectName}FilterInput!`;
      return null;
    },
  },
  {
    regex: /^merge(.+)$/,
    getArgType: (_objectName, argName) => {
      if (argName === 'ids') return '[UUID!]!';
      if (argName === 'conflictPriorityIndex') return 'Int!';
      if (argName === 'dryRun') return 'Boolean';
      return null;
    },
  },
];

const QUERY_COMMON_ARG_TYPES: Record<string, string> = {
  first: 'Int',
  last: 'Int',
  offset: 'Int',
  offsetForRecords: 'Int',
  limit: 'Int',
  before: 'String',
  after: 'String',
  id: 'UUID!',
  ids: '[UUID]',
  upsert: 'Boolean',
  dryRun: 'Boolean',
  conflictPriorityIndex: 'Int!',
  viewId: 'UUID',
};

const inferArgTypeForUnprefixedResolver = (
  resolverName: string,
  argName: string,
): string | null => {
  const commonType = QUERY_COMMON_ARG_TYPES[argName];

  if (commonType) return commonType;

  let objectName = resolverName;

  if (resolverName.endsWith('Duplicates')) {
    objectName = resolverName.slice(0, -'Duplicates'.length);
  } else if (resolverName.endsWith('GroupBy')) {
    objectName = resolverName.slice(0, -'GroupBy'.length);
  }

  const pascalObjectName =
    objectName.charAt(0).toUpperCase() + objectName.slice(1);

  if (argName === 'filter') return `${pascalObjectName}FilterInput`;
  if (argName === 'orderBy') return `[${pascalObjectName}OrderByInput]`;
  if (argName === 'orderByForRecords')
    return `[${pascalObjectName}OrderByInput]`;
  if (argName === 'groupBy') return `[${pascalObjectName}GroupByInput!]!`;
  if (argName === 'data') return `[${pascalObjectName}CreateInput!]`;

  return null;
};

export const inferArgType = (
  operationName: string,
  argName: string,
): string => {
  for (const pattern of RESOLVER_PATTERNS) {
    const match = operationName.match(pattern.regex);

    if (!match) continue;

    const objectName = match[1]!;
    const resolved = pattern.getArgType(objectName, argName);

    if (resolved) return resolved;
  }

  const unprefixedResult = inferArgTypeForUnprefixedResolver(
    operationName,
    argName,
  );

  if (unprefixedResult) return unprefixedResult;

  throw new Error(
    `Cannot infer GraphQL type for argument '${argName}' ` +
      `on operation '${operationName}'. ` +
      `Run 'twenty app:build' to generate a typed client.`,
  );
};
