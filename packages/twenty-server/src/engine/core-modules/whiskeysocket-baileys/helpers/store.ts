import { makeInMemoryStore } from '@whiskeysockets/baileys';
import MAIN_LOGGER from '@whiskeysockets/baileys/lib/Utils/logger';

const logger = MAIN_LOGGER.child({});
logger.level = 'trace';

export const makeStore: any = () => {
  const store = makeInMemoryStore({ logger });
  store.readFromFile('./baileys_store_multi.json');
  setInterval(() => {
    store.writeToFile('./baileys_store_multi.json');
  }, 10_000);
  return store;
};
