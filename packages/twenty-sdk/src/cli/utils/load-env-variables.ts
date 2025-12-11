import * as fs from 'fs-extra';
import dotenv from 'dotenv';
import { findPathFile } from '@/cli/utils/find-path-file';

export const loadEnvVariables = async (appPath: string) => {
  let envFile = '';

  try {
    const envFilePath = await findPathFile(appPath, '.env');

    envFile = await fs.readFile(envFilePath, 'utf8');
  } catch {
    // Allow missing .env
  }

  return dotenv.parse(envFile);
};
