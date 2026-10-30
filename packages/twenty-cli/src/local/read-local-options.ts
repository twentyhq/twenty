import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { getLocalEnvironment } from '@/local/get-local-environment';
import { readLocalInteger } from '@/local/read-local-integer';

export const readLocalOptions = (options: Record<string, unknown>) => ({
  environment: getLocalEnvironment(readBooleanOption(options, 'test')),
  port: readLocalInteger({
    value: readStringOption(options, 'port'),
    name: '--port',
    maximum: 65535,
  }),
});
