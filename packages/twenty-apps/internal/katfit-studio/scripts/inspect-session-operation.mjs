import { inspectSessionOperation } from '../src/logic-functions/utils/inspect-session-operation.ts';
import { createSessionOperatorClient } from './session-operator-client.mjs';

if (!process.argv[2]) {
  console.error(
    'Usage: node --experimental-strip-types --import ./scripts/register-test-hooks.mjs scripts/inspect-session-operation.mjs <operationKey>',
  );
  process.exit(2);
}
try {
  const result = await inspectSessionOperation(
    createSessionOperatorClient(),
    process.argv[2],
  );
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'inspected') process.exitCode = 1;
} catch {
  console.error('Inspection unavailable; no changes were sent.');
  process.exitCode = 1;
}
