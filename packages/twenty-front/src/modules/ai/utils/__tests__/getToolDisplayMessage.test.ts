import { i18n } from '@lingui/core';

import {
  getToolDisplayMessage,
  resolveToolInput,
} from '@/ai/utils/getToolDisplayMessage';

beforeEach(() => {
  i18n.load('en', {});
  i18n.activate('en');
});

describe('resolveToolInput', () => {
  it('should pass through non-execute_tool inputs unchanged', () => {
    const input = { query: 'test' };
    const result = resolveToolInput(input, 'web_search');

    expect(result).toEqual({
      resolvedInput: input,
      resolvedToolName: 'web_search',
    });
  });

  it('should unwrap execute_tool input', () => {
    const input = {
      toolName: 'find_companies',
      arguments: { filter: { name: 'Acme' } },
    };
    const result = resolveToolInput(input, 'execute_tool');

    expect(result).toEqual({
      resolvedInput: { filter: { name: 'Acme' } },
      resolvedToolName: 'find_companies',
    });
  });

  it('should return original input for non-execute_tool even with toolName field', () => {
    const input = { toolName: 'inner', arguments: {} };
    const result = resolveToolInput(input, 'web_search');

    expect(result).toEqual({
      resolvedInput: input,
      resolvedToolName: 'web_search',
    });
  });
});

describe('getToolDisplayMessage', () => {
  describe('web_search', () => {
    it('should show finished message with query', () => {
      const message = getToolDisplayMessage(
        { query: 'CRM tools' },
        'web_search',
        true,
      );

      expect(message).toContain('Searched');
      expect(message).toContain('CRM tools');
    });

    it('should show in-progress message with query', () => {
      const message = getToolDisplayMessage(
        { query: 'CRM tools' },
        'web_search',
        false,
      );

      expect(message).toContain('Searching');
      expect(message).toContain('CRM tools');
    });

    it('should handle nested query format', () => {
      const message = getToolDisplayMessage(
        { action: { query: 'nested query' } },
        'web_search',
        true,
      );

      expect(message).toContain('nested query');
    });

    it('should handle missing query', () => {
      const message = getToolDisplayMessage({}, 'web_search', true);

      expect(message).toContain('Searched the web');
    });
  });

  describe('learn_tools', () => {
    it('should show tool names when provided', () => {
      const message = getToolDisplayMessage(
        { toolNames: ['find_companies', 'create_task'] },
        'learn_tools',
        true,
      );

      expect(message).toContain('Learned');
      expect(message).toContain('find_companies, create_task');
    });

    it('should show generic message without tool names', () => {
      const message = getToolDisplayMessage({}, 'learn_tools', true);

      expect(message).toContain('Learned tools');
    });
  });

  describe('load_skills', () => {
    it('should show skill names when provided', () => {
      const message = getToolDisplayMessage(
        { skillNames: ['data-manipulation'] },
        'load_skills',
        false,
      );

      expect(message).toContain('Loading');
      expect(message).toContain('data-manipulation');
    });

    it('should show generic message without skill names', () => {
      const message = getToolDisplayMessage({}, 'load_skills', true);

      expect(message).toContain('Loaded skills');
    });
  });

  describe('custom loading message', () => {
    it('should use loadingMessage when provided', () => {
      const message = getToolDisplayMessage(
        { loadingMessage: 'Building dashboard...' },
        'some_tool',
        false,
      );

      expect(message).toBe('Building dashboard...');
    });
  });

  describe('generic tools', () => {
    it('should format tool name with spaces for finished state', () => {
      const message = getToolDisplayMessage(
        {},
        'create_complete_dashboard',
        true,
      );

      expect(message).toContain('Ran');
      expect(message).toContain('create complete dashboard');
    });

    it('should format tool name with spaces for in-progress state', () => {
      const message = getToolDisplayMessage(
        {},
        'create_complete_dashboard',
        false,
      );

      expect(message).toContain('Running');
      expect(message).toContain('create complete dashboard');
    });
  });

  describe('execute_tool wrapper', () => {
    it('should unwrap execute_tool and display inner tool name', () => {
      const message = getToolDisplayMessage(
        { toolName: 'find_companies', arguments: { limit: 10 } },
        'execute_tool',
        true,
      );

      expect(message).toContain('Ran');
      expect(message).toContain('find companies');
    });
  });
});
