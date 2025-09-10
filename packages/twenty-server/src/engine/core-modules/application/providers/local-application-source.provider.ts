import { Injectable } from '@nestjs/common';

import { promises as fs } from 'fs';
import * as path from 'path';

import { ApplicationManifest } from 'src/engine/core-modules/application/types/application-manifest.type';

@Injectable()
export class LocalApplicationSourceProvider {
  async fetchManifest(localPath: string): Promise<ApplicationManifest> {
    const manifestPath = path.join(localPath, 'twenty-app.json');

    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');

      return JSON.parse(manifestContent) as ApplicationManifest;
    } catch (error) {
      throw new Error(
        `Failed to read manifest from ${manifestPath}: ${error.message}`,
      );
    }
  }

  async validateSource(localPath: string): Promise<boolean> {
    const manifestPath = path.join(localPath, 'twenty-app.json');

    try {
      await fs.access(manifestPath);

      return true;
    } catch {
      return false;
    }
  }
}
