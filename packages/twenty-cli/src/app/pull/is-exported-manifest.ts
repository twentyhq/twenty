import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type ExportedManifest } from '@/app/types/exported-manifest.type';

export const isExportedManifest = (value: unknown): value is ExportedManifest =>
  isPlainObject(value) &&
  isPlainObject(value.application) &&
  isString(value.application.universalIdentifier);
