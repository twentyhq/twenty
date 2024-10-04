/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';

import { existsSync } from 'fs';
import fs from 'fs/promises';
import { join as joinPath } from 'path';

import { kebabCase } from 'src/utils/kebab-case';

@Injectable()
export class CommandLogger {
  constructor(private readonly className: string) {}

  async createSubDirectory(subDirectory: string): Promise<void> {
    const path = `./logs/${kebabCase(this.className)}/${subDirectory}`;

    if (existsSync(path) === false) {
      await fs.mkdir(path, { recursive: true });
    }

    return;
  }

  async writeLog(
    fileName: string,
    data: unknown,
    append = false,
  ): Promise<string> {
    const path = `./logs/${kebabCase(this.className)}`;

    if (existsSync(path) === false) {
      await fs.mkdir(path, { recursive: true });
    }

    try {
      const logFilePath = `${path}/${fileName}.json`;

      await fs.writeFile(logFilePath, JSON.stringify(data, null, 2), {
        flag: append ? 'a' : 'w',
      });

      const absoluteLogFilePath = joinPath(process.cwd(), logFilePath);

      return absoluteLogFilePath;
    } catch (err) {
      console.error(
        `Error writing to file ${path}/${fileName}.json: ${err?.message}`,
      );

      throw err;
    }
  }
}
