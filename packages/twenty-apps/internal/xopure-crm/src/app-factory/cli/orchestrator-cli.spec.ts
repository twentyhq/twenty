import { describe, expect, it } from 'vitest';

import {
  executeOrchestratorCli,
  parseOrchestratorCliArgs,
} from './orchestrator-cli';

describe('orchestrator-cli', () => {
  it('should reject missing spec arguments', () => {
    const result = parseOrchestratorCliArgs([]);

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error).toContain('--spec or --spec-json');
    }
  });

  it('should reject when both spec sources are provided', () => {
    const result = parseOrchestratorCliArgs([
      '--spec',
      './spec.json',
      '--spec-json',
      '{"app":{}}',
    ]);

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error).toContain('either --spec or --spec-json');
    }
  });

  it('should return pipeline validation errors when spec-json is invalid', () => {
    const result = executeOrchestratorCli(['--spec-json', '{"not":"valid"}']);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.commands).toEqual([]);
  });
});
