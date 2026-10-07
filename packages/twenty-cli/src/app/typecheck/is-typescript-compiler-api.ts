import { isFunction, isNumber } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';
import type ts from 'typescript';

export const isTypeScriptCompilerApi = (value: unknown): value is typeof ts =>
  isPlainObject(value) &&
  [
    'readConfigFile',
    'parseJsonConfigFileContent',
    'createProgram',
    'getPreEmitDiagnostics',
    'flattenDiagnosticMessageText',
  ].every((name) => isFunction(value[name])) &&
  isPlainObject(value.sys) &&
  isFunction(value.sys.readFile) &&
  isPlainObject(value.DiagnosticCategory) &&
  isNumber(value.DiagnosticCategory.Warning);
