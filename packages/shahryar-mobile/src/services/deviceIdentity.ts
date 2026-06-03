import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'shahryar-ops.db';
const DEVICE_ID_KEY = 'deviceId';

type DeviceIdentityRow = {
  value: string;
};

const createDeviceId = (): string =>
  `shahryar-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

export const getOrCreateShahryarMobileDeviceId = async (): Promise<string> => {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS mobile_device_identity (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  const existingDevice = await database.getFirstAsync<DeviceIdentityRow>(
    'SELECT value FROM mobile_device_identity WHERE key = ? LIMIT 1;',
    DEVICE_ID_KEY,
  );

  if (existingDevice !== null && existingDevice.value.trim().length > 0) {
    return existingDevice.value;
  }

  const deviceId = createDeviceId();

  await database.runAsync(
    `INSERT OR REPLACE INTO mobile_device_identity (key, value)
     VALUES (?, ?);`,
    DEVICE_ID_KEY,
    deviceId,
  );

  return deviceId;
};
