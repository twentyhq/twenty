import os from 'os';

export const POD_NAME = process.env.HOSTNAME ?? os.hostname();
