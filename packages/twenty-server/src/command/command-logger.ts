import { Injectable } from '@nestjs/common';

import { existsSync } from 'fs';
import fs from 'fs/promises';

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
    append: boolean = false,
  ): Promise<void> {
    const path = `./logs/${kebabCase(this.className)}`;

    if (existsSync(path) === false) {
      await fs.mkdir(path, { recursive: true });
    }

    try {
      await fs.writeFile(
        `${path}/${fileName}.json`,
        JSON.stringify(data, null, 2),
        {
          flag: append ? 'a' : 'w',
        },
      );
    } catch (err) {
      console.error(
        `Error writing to file ${path}/${fileName}.json: ${err?.message}`,
      );
      throw err;
    }
  }
}
