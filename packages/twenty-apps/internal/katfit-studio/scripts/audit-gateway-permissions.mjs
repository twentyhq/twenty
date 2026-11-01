import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../src/', import.meta.url);
const role = await readFile(
  new URL('roles/default-function.role.ts', root),
  'utf8',
);
const routeFiles = (await readdir(new URL('logic-functions/', root)))
  .filter((file) => file.endsWith('.ts'))
  .sort();
const routes = [];
for (const file of routeFiles) {
  const source = await readFile(
    new URL(`logic-functions/${file}`, root),
    'utf8',
  );
  if (!source.includes('httpRouteTriggerSettings:')) continue;
  const settings = source.slice(source.indexOf('httpRouteTriggerSettings:'));
  routes.push({
    file,
    path: settings.match(/path:\s*['"]([^'"]+)['"]/)?.[1] ?? null,
    method: settings.match(/httpMethod:\s*['"]([^'"]+)['"]/)?.[1] ?? null,
    authenticationDeclared: /isAuthRequired:\s*true/.test(settings),
  });
}
const findings = [
  ...(role.match(/canReadAllObjectRecords:\s*true/)
    ? ['APPLICATION_ROLE_GLOBAL_READ']
    : []),
  ...(role.match(/canUpdateAllObjectRecords:\s*true/)
    ? ['APPLICATION_ROLE_GLOBAL_UPDATE']
    : []),
  ...routes
    .filter((route) => !route.authenticationDeclared)
    .map((route) => `ROUTE_AUTHENTICATION_NOT_DECLARED:${route.file}`),
  'EFFECTIVE_WORKSPACE_ROLES_NOT_VERIFIED',
  'DIRECT_GRAPHQL_AND_REST_WRITE_DENIAL_NOT_VERIFIED',
  'FUNCTION_INVOCATION_AUTHORIZATION_NOT_VERIFIED',
];
console.log(
  JSON.stringify(
    {
      status: 'not-ready',
      evidence: 'local-source-declarations-only',
      findings,
      routes,
      explanation:
        'Authentication alone does not establish operator authorization or prevent direct API mutation. This command neither changes roles nor verifies a live workspace.',
    },
    null,
    2,
  ),
);
// Source metadata cannot establish the effective permissions of installed users and API keys.
process.exitCode = 2;
