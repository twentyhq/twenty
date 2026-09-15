import { type Config } from './config';
import { writeClientFiles } from './tasks/clientTasks';
import { loadConfiguredSchema } from './tasks/schemaTask';

// Drop-in replacement for `@genql/cli`'s `generate`, narrowed to the
// schema-string code path Twenty uses. See ./README.md for details.
export const generate = async (config: Config): Promise<void> => {
  if (!config.output) {
    throw new Error('`output` must be defined in the config');
  }

  const schema = await loadConfiguredSchema(config);
  await writeClientFiles(config, schema);
};
