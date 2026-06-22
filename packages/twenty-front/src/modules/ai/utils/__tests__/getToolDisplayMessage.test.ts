import { i18n } from '@lingui/core';

import { type ToolLabel } from '@/ai/hooks/useToolLabel';
import {
  resolveToolDisplayMessage,
  resolveToolInput,
} from '@/ai/utils/getToolDisplayMessage';

const emptyLabelMap = new Map<string, ToolLabel>();

const makeLabelMap = (
  entries: Array<[string, ToolLabel]>,
): Map<string, ToolLabel> => new Map(entries);

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
      toolName: 'find_many_companies',
      arguments: { filter: { name: 'Acme' } },
    };
    const result = resolveToolInput(input, 'execute_tool');

    expect(result).toEqual({
      resolvedInput: { filter: { name: 'Acme' } },
      resolvedToolName: 'find_many_companies',
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

describe('resolveToolDisplayMessage', () => {
  describe('web_search', () => {
    it('should show finished message with query', () => {
      const message = resolveToolDisplayMessage({
        input: { query: 'CRM tools' },
        toolName: 'web_search',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Searched');
      expect(message).toContain('CRM tools');
    });

    it('should show in-progress message with query', () => {
      const message = resolveToolDisplayMessage({
        input: { query: 'CRM tools' },
        toolName: 'web_search',
        isFinished: false,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Searching');
      expect(message).toContain('CRM tools');
    });

    it('should handle nested query format', () => {
      const message = resolveToolDisplayMessage({
        input: { action: { query: 'nested query' } },
        toolName: 'web_search',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('nested query');
    });

    it('should handle missing query', () => {
      const message = resolveToolDisplayMessage({
        input: {},
        toolName: 'web_search',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Searched the web');
    });
  });

  describe('app_exa_web_search', () => {
    it('should show the same searching-the-web message as native web_search', () => {
      const message = resolveToolDisplayMessage({
        input: { query: 'CRM tools' },
        toolName: 'app_exa_web_search',
        isFinished: false,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Searching');
      expect(message).toContain('CRM tools');
    });

    it('should handle missing query', () => {
      const message = resolveToolDisplayMessage({
        input: {},
        toolName: 'app_exa_web_search',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Searched the web');
    });
  });

  describe('learn_tools', () => {
    it('should show tool names when provided', () => {
      const message = resolveToolDisplayMessage({
        input: { toolNames: ['find_many_companies', 'create_one_task'] },
        toolName: 'learn_tools',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Learned');
      expect(message).toContain('find_many_companies, create_one_task');
    });

    it('should show generic message without tool names', () => {
      const message = resolveToolDisplayMessage({
        input: {},
        toolName: 'learn_tools',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Learned tools');
    });

    it('should resolve inner tool names to their labels from the label map', () => {
      const labelMap = makeLabelMap([
        [
          'find_many_companies',
          { label: 'Search companies', inProgressLabel: 'Searching companies' },
        ],
        ['create_one_task', { label: 'Create task' }],
      ]);

      const message = resolveToolDisplayMessage({
        input: { toolNames: ['find_many_companies', 'create_one_task'] },
        toolName: 'learn_tools',
        isFinished: true,
        labelMap,
      });

      expect(message).toContain('Search companies, Create task');
    });

    it('should fall back to the raw tool name when the label map has no entry', () => {
      const labelMap = makeLabelMap([
        ['find_many_companies', { label: 'Search companies' }],
      ]);

      const message = resolveToolDisplayMessage({
        input: { toolNames: ['find_many_companies', 'app_unknown_tool'] },
        toolName: 'learn_tools',
        isFinished: true,
        labelMap,
      });

      expect(message).toContain('Search companies, app_unknown_tool');
    });

    it('should resolve labels from output when not in the label map', () => {
      const output = {
        tools: [
          { name: 'app_unknown_tool', label: 'Unknown Tool Label' },
        ],
      };

      const message = resolveToolDisplayMessage({
        input: { toolNames: ['app_unknown_tool'] },
        toolName: 'learn_tools',
        isFinished: true,
        labelMap: emptyLabelMap,
        output,
      });

      expect(message).toContain('Unknown Tool Label');
    });
  });

  describe('load_skills', () => {
    it('should show skill names when provided', () => {
      const message = resolveToolDisplayMessage({
        input: { skillNames: ['data-manipulation'] },
        toolName: 'load_skills',
        isFinished: false,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Loading');
      expect(message).toContain('data-manipulation');
    });

    it('should show generic message without skill names', () => {
      const message = resolveToolDisplayMessage({
        input: {},
        toolName: 'load_skills',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Loaded skills');
    });

    it('should resolve inner skill names from output labels', () => {
      const output = {
        skills: [{ name: 'data-manipulation', label: 'Data manipulation' }],
      };

      const message = resolveToolDisplayMessage({
        input: { skillNames: ['data-manipulation'] },
        toolName: 'load_skills',
        isFinished: true,
        labelMap: emptyLabelMap,
        output,
      });

      expect(message).toContain('Data manipulation');
    });
  });

  describe('code_interpreter (model-generated labels)', () => {
    it('should use loadingMessage when in progress', () => {
      const message = resolveToolDisplayMessage({
        input: { code: 'print(1)', loadingMessage: 'Analyzing sales data' },
        toolName: 'code_interpreter',
        isFinished: false,
        labelMap: emptyLabelMap,
      });

      expect(message).toBe('Analyzing sales data');
    });

    it('should use completedMessage when finished', () => {
      const message = resolveToolDisplayMessage({
        input: {
          code: 'print(1)',
          loadingMessage: 'Analyzing sales data',
          completedMessage: 'Analyzed sales data',
        },
        toolName: 'code_interpreter',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toBe('Analyzed sales data');
    });

    it('should fall back to loadingMessage when completedMessage is missing', () => {
      const message = resolveToolDisplayMessage({
        input: { code: 'print(1)', loadingMessage: 'Analyzing sales data' },
        toolName: 'code_interpreter',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toBe('Analyzing sales data');
    });

    it('should fall back to generic label when loadingMessage is absent', () => {
      const message = resolveToolDisplayMessage({
        input: { code: 'print(1)' },
        toolName: 'code_interpreter',
        isFinished: false,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Running code');
    });

    it('should not use loadingMessage for non-code_interpreter tools', () => {
      const message = resolveToolDisplayMessage({
        input: { loadingMessage: 'Some status' },
        toolName: 'some_tool',
        isFinished: false,
        labelMap: emptyLabelMap,
      });

      expect(message).not.toBe('Some status');
      expect(message).toContain('Running');
      expect(message).toContain('some_tool');
    });
  });

  describe('tool label from label map', () => {
    it('should use label from map for display when available', () => {
      const labelMap = makeLabelMap([
        ['create_one_company', { label: 'Create Company' }],
      ]);

      const message = resolveToolDisplayMessage({
        input: {},
        toolName: 'create_one_company',
        isFinished: true,
        labelMap,
      });

      expect(message).toContain('Ran');
      expect(message).toContain('Create Company');
    });

    it('should use label from map for in-progress state', () => {
      const labelMap = makeLabelMap([
        ['find_many_people', { label: 'Search People' }],
      ]);

      const message = resolveToolDisplayMessage({
        input: {},
        toolName: 'find_many_people',
        isFinished: false,
        labelMap,
      });

      expect(message).toContain('Running');
      expect(message).toContain('Search People');
    });

    it('should fall back to tool name when label map has no entry', () => {
      const message = resolveToolDisplayMessage({
        input: {},
        toolName: 'create_complete_dashboard',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Ran');
      expect(message).toContain('create_complete_dashboard');
    });
  });

  describe('conjugated labels', () => {
    it('should use the completed label when finished', () => {
      const labelMap = makeLabelMap([
        [
          'create_one_person',
          {
            label: 'Create person',
            inProgressLabel: 'Creating person',
            completedLabel: 'Created person',
          },
        ],
      ]);

      const message = resolveToolDisplayMessage({
        input: {},
        toolName: 'create_one_person',
        isFinished: true,
        labelMap,
      });

      expect(message).toBe('Created person');
    });

    it('should use the in-progress label when not finished', () => {
      const labelMap = makeLabelMap([
        [
          'create_one_person',
          {
            label: 'Create person',
            inProgressLabel: 'Creating person',
            completedLabel: 'Created person',
          },
        ],
      ]);

      const message = resolveToolDisplayMessage({
        input: {},
        toolName: 'create_one_person',
        isFinished: false,
        labelMap,
      });

      expect(message).toBe('Creating person');
    });

    it('should fall back to Ran/Running when conjugated labels are absent', () => {
      const labelMap = makeLabelMap([
        ['create_one_person', { label: 'Create person' }],
      ]);

      const finished = resolveToolDisplayMessage({
        input: {},
        toolName: 'create_one_person',
        isFinished: true,
        labelMap,
      });
      const inProgress = resolveToolDisplayMessage({
        input: {},
        toolName: 'create_one_person',
        isFinished: false,
        labelMap,
      });

      expect(finished).toContain('Ran');
      expect(inProgress).toContain('Running');
    });
  });

  describe('execute_tool wrapper', () => {
    it('should unwrap execute_tool and display inner tool label from map', () => {
      const labelMap = makeLabelMap([
        ['find_many_companies', { label: 'Search Companies' }],
      ]);

      const message = resolveToolDisplayMessage({
        input: { toolName: 'find_many_companies', arguments: { limit: 10 } },
        toolName: 'execute_tool',
        isFinished: true,
        labelMap,
      });

      expect(message).toContain('Ran');
      expect(message).toContain('Search Companies');
    });

    it('should unwrap execute_tool and fall back to tool name without label', () => {
      const message = resolveToolDisplayMessage({
        input: { toolName: 'find_many_companies', arguments: { limit: 10 } },
        toolName: 'execute_tool',
        isFinished: true,
        labelMap: emptyLabelMap,
      });

      expect(message).toContain('Ran');
      expect(message).toContain('find_many_companies');
    });
  });
});
