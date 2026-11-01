import { recoverTerminalSessionOperation } from '../src/logic-functions/utils/inspect-session-operation.ts';
import { createSessionOperatorClient } from './session-operator-client.mjs';

if (!process.argv[2] || !process.argv[3]) {
  console.error(
    'Usage: node --experimental-strip-types --import ./scripts/register-test-hooks.mjs scripts/recover-terminal-session-operation.mjs <operationKey> <expectedSnapshot>',
  );
  process.exit(2);
}
try {
  const result = await recoverTerminalSessionOperation(
    createSessionOperatorClient(),
    process.argv[2],
    process.argv[3],
  );
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'released') process.exitCode = 1;
} catch {
  console.error(
    'Recovery unconfirmed; inspect the journal and resource ownership again.',
  );
  process.exitCode = 1;
}
