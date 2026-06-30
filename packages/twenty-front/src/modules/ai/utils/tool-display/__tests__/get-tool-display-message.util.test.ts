import { i18n } from '@lingui/core';
import { ToolCategory } from 'twenty-shared/ai';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getToolDisplayMessage } from '@/ai/utils/tool-display/get-tool-display-message';
import { unwrapToolInput } from '@/ai/utils/tool-display/unwrap-tool-input.util';
import { type ToolDisplayContext } from '@/ai/types/tool-display-context.type';

const emptyDisplayContext: ToolDisplayContext = {
  labelByName: new Map(),
  indexByName: new Map(),
  objectMetadataItems: [],
};

const makeDisplayContext = ({
  labels = [],
  indexEntries = [],
  objectMetadataItems = [],
}: {
  labels?: Array<[string, string]>;
  indexEntries?: Array<
    [string, { category: ToolCategory; objectName?: string | null }]
  >;
  objectMetadataItems?: Array<
    Pick<
      EnrichedObjectMetadataItem,
      'nameSingular' | 'namePlural' | 'labelSingular' | 'labelPlural'
    >
  >;
}): ToolDisplayContext => ({
  labelByName: new Map(labels),
  indexByName: new Map(indexEntries),
  objectMetadataItems: objectMetadataItems as EnrichedObjectMetadataItem[],
});

const personMetadata = {
  nameSingular: 'person',
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
};

beforeEach(() => {
  i18n.load('en', {});
  i18n.activate('en');
});

describe('unwrapToolInput', () => {
  it('should pass through non-execute_tool inputs unchanged', () => {
    const input = { query: 'test' };
    const result = unwrapToolInput({ input, toolName: 'web_search' });

    expect(result).toEqual({
      toolInput: input,
      toolName: 'web_search',
    });
  });

  it('should unwrap execute_tool input', () => {
    const input = {
      toolName: 'find_many_companies',
      arguments: { filter: { name: 'Acme' } },
    };
    const result = unwrapToolInput({ input, toolName: 'execute_tool' });

    expect(result).toEqual({
      toolInput: { filter: { name: 'Acme' } },
      toolName: 'find_many_companies',
    });
  });

  it('should return original input for non-execute_tool even with toolName field', () => {
    const input = { toolName: 'inner', arguments: {} };
    const result = unwrapToolInput({ input, toolName: 'web_search' });

    expect(result).toEqual({
      toolInput: input,
      toolName: 'web_search',
    });
  });
});

describe('getToolDisplayMessage', () => {
  describe('web_search', () => {
    it('should show finished message with query', () => {
      const message = getToolDisplayMessage({
        input: { query: 'CRM tools' },
        toolName: 'web_search',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Searched');
      expect(message).toContain('CRM tools');
    });

    it('should show in-progress message with query', () => {
      const message = getToolDisplayMessage({
        input: { query: 'CRM tools' },
        toolName: 'web_search',
        isFinished: false,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Searching');
      expect(message).toContain('CRM tools');
    });

    it('should handle nested query format', () => {
      const message = getToolDisplayMessage({
        input: { action: { query: 'nested query' } },
        toolName: 'web_search',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('nested query');
    });

    it('should handle missing query', () => {
      const message = getToolDisplayMessage({
        input: {},
        toolName: 'web_search',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Searched the web');
    });
  });

  describe('app_exa_web_search', () => {
    it('should show the same searching-the-web message as native web_search', () => {
      const message = getToolDisplayMessage({
        input: { query: 'CRM tools' },
        toolName: 'app_exa_web_search',
        isFinished: false,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Searching');
      expect(message).toContain('CRM tools');
    });

    it('should handle missing query', () => {
      const message = getToolDisplayMessage({
        input: {},
        toolName: 'app_exa_web_search',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Searched the web');
    });
  });

  describe('learn_tools', () => {
    it('should show tool names when provided', () => {
      const message = getToolDisplayMessage({
        input: { toolNames: ['find_many_companies', 'create_one_task'] },
        toolName: 'learn_tools',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Learned');
      expect(message).toContain('find_many_companies');
      expect(message).toContain('create_one_task');
    });

    it('should show generic message without tool names', () => {
      const message = getToolDisplayMessage({
        input: {},
        toolName: 'learn_tools',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Learned tools');
    });

    it('should resolve inner tool names to their labels from the label map', () => {
      const displayContext = makeDisplayContext({
        labels: [
          ['find_many_companies', 'Search companies'],
          ['create_one_task', 'Create task'],
        ],
      });

      const message = getToolDisplayMessage({
        input: { toolNames: ['find_many_companies', 'create_one_task'] },
        toolName: 'learn_tools',
        isFinished: true,
        displayContext,
      });

      expect(message).toContain('Search companies');
      expect(message).toContain('Create task');
    });

    it('should fall back to the raw tool name when the label map has no entry', () => {
      const displayContext = makeDisplayContext({
        labels: [['find_many_companies', 'Search companies']],
      });

      const message = getToolDisplayMessage({
        input: { toolNames: ['find_many_companies', 'app_unknown_tool'] },
        toolName: 'learn_tools',
        isFinished: true,
        displayContext,
      });

      expect(message).toContain('Search companies');
      expect(message).toContain('app_unknown_tool');
    });

    it('should resolve labels from output when not in the label map', () => {
      const output = {
        tools: [{ name: 'app_unknown_tool', label: 'Unknown Tool Label' }],
      };

      const message = getToolDisplayMessage({
        input: { toolNames: ['app_unknown_tool'] },
        toolName: 'learn_tools',
        isFinished: true,
        displayContext: emptyDisplayContext,
        output,
      });

      expect(message).toContain('Unknown Tool Label');
    });
  });

  describe('load_skills', () => {
    it('should show skill names when provided', () => {
      const message = getToolDisplayMessage({
        input: { skillNames: ['data-manipulation'] },
        toolName: 'load_skills',
        isFinished: false,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Loading');
      expect(message).toContain('data-manipulation');
    });

    it('should show generic message without skill names', () => {
      const message = getToolDisplayMessage({
        input: {},
        toolName: 'load_skills',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Loaded skills');
    });

    it('should resolve inner skill names from output labels', () => {
      const output = {
        skills: [{ name: 'data-manipulation', label: 'Data manipulation' }],
      };

      const message = getToolDisplayMessage({
        input: { skillNames: ['data-manipulation'] },
        toolName: 'load_skills',
        isFinished: true,
        displayContext: emptyDisplayContext,
        output,
      });

      expect(message).toContain('Data manipulation');
    });
  });

  describe('code_interpreter (model-generated labels)', () => {
    it('should use loadingMessage when in progress', () => {
      const message = getToolDisplayMessage({
        input: { code: 'print(1)', loadingMessage: 'Analyzing sales data' },
        toolName: 'code_interpreter',
        isFinished: false,
        displayContext: emptyDisplayContext,
      });

      expect(message).toBe('Analyzing sales data');
    });

    it('should use completedMessage when finished', () => {
      const message = getToolDisplayMessage({
        input: {
          code: 'print(1)',
          loadingMessage: 'Analyzing sales data',
          completedMessage: 'Analyzed sales data',
        },
        toolName: 'code_interpreter',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toBe('Analyzed sales data');
    });

    it('should fall back to loadingMessage when completedMessage is missing', () => {
      const message = getToolDisplayMessage({
        input: { code: 'print(1)', loadingMessage: 'Analyzing sales data' },
        toolName: 'code_interpreter',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toBe('Analyzing sales data');
    });

    it('should fall back to generic label when loadingMessage is absent', () => {
      const message = getToolDisplayMessage({
        input: { code: 'print(1)' },
        toolName: 'code_interpreter',
        isFinished: false,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Running code');
    });

    it('should fall back to generic label when loadingMessage is empty', () => {
      const message = getToolDisplayMessage({
        input: { code: 'print(1)', loadingMessage: '' },
        toolName: 'code_interpreter',
        isFinished: false,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Running code');
    });

    it('should not use loadingMessage for non-code_interpreter tools', () => {
      const message = getToolDisplayMessage({
        input: { loadingMessage: 'Some status' },
        toolName: 'some_tool',
        isFinished: false,
        displayContext: emptyDisplayContext,
      });

      expect(message).not.toBe('Some status');
      expect(message).toContain('Running');
      expect(message).toContain('some_tool');
    });
  });

  describe('default tool labels', () => {
    it('should use default Ran/Running for non-CRUD tools', () => {
      const displayContext = makeDisplayContext({
        labels: [['create_complete_dashboard', 'Create Dashboard']],
      });

      const message = getToolDisplayMessage({
        input: {},
        toolName: 'create_complete_dashboard',
        isFinished: true,
        displayContext,
      });

      expect(message).toContain('Ran');
      expect(message).toContain('Create Dashboard');
    });

    it('should fall back to tool name when label map has no entry', () => {
      const message = getToolDisplayMessage({
        input: {},
        toolName: 'create_complete_dashboard',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toContain('Ran');
      expect(message).toContain('create_complete_dashboard');
    });

    it('should use default Ran/Running for action tools without custom status labels', () => {
      const displayContext = makeDisplayContext({
        labels: [['http_request', 'HTTP Request']],
        indexEntries: [['http_request', { category: ToolCategory.ACTION }]],
      });

      const finished = getToolDisplayMessage({
        input: {},
        toolName: 'http_request',
        isFinished: true,
        displayContext,
      });
      const inProgress = getToolDisplayMessage({
        input: {},
        toolName: 'http_request',
        isFinished: false,
        displayContext,
      });

      expect(finished).toContain('Ran');
      expect(finished).toContain('HTTP Request');
      expect(inProgress).toContain('Running');
      expect(inProgress).toContain('HTTP Request');
    });
  });

  describe('CRUD status labels', () => {
    it('should build completed label from object metadata', () => {
      const displayContext = makeDisplayContext({
        labels: [['create_one_person', 'Create person']],
        indexEntries: [
          [
            'create_one_person',
            { category: ToolCategory.DATABASE_CRUD, objectName: 'person' },
          ],
        ],
        objectMetadataItems: [personMetadata],
      });

      const message = getToolDisplayMessage({
        input: {},
        toolName: 'create_one_person',
        isFinished: true,
        displayContext,
      });

      expect(message).toBe('Created person');
    });

    it('should build in-progress label from object metadata', () => {
      const displayContext = makeDisplayContext({
        labels: [['create_one_person', 'Create person']],
        indexEntries: [
          [
            'create_one_person',
            { category: ToolCategory.DATABASE_CRUD, objectName: 'person' },
          ],
        ],
        objectMetadataItems: [personMetadata],
      });

      const message = getToolDisplayMessage({
        input: {},
        toolName: 'create_one_person',
        isFinished: false,
        displayContext,
      });

      expect(message).toBe('Creating person');
    });

    it('should fall back to generic Ran/Running when object metadata is missing', () => {
      const displayContext = makeDisplayContext({
        labels: [['create_one_person', 'Create person']],
      });

      const finished = getToolDisplayMessage({
        input: {},
        toolName: 'create_one_person',
        isFinished: true,
        displayContext,
      });
      const inProgress = getToolDisplayMessage({
        input: {},
        toolName: 'create_one_person',
        isFinished: false,
        displayContext,
      });

      expect(finished).toBe('Ran Create person');
      expect(inProgress).toBe('Running Create person');
    });
  });

  describe('action status labels', () => {
    it('should use custom action status labels when available', () => {
      const displayContext = makeDisplayContext({
        labels: [['send_email', 'Send Email']],
        indexEntries: [['send_email', { category: ToolCategory.ACTION }]],
      });

      const finished = getToolDisplayMessage({
        input: {},
        toolName: 'send_email',
        isFinished: true,
        displayContext,
      });
      const inProgress = getToolDisplayMessage({
        input: {},
        toolName: 'send_email',
        isFinished: false,
        displayContext,
      });

      expect(finished).toBe('Sent email');
      expect(inProgress).toBe('Sending email');
    });
  });

  describe('execute_tool wrapper', () => {
    it('should unwrap execute_tool and display inner tool label from map', () => {
      const displayContext = makeDisplayContext({
        labels: [['find_many_companies', 'Search Companies']],
      });

      const message = getToolDisplayMessage({
        input: { toolName: 'find_many_companies', arguments: { limit: 10 } },
        toolName: 'execute_tool',
        isFinished: true,
        displayContext,
      });

      expect(message).toBe('Ran Search Companies');
    });

    it('should unwrap execute_tool and fall back to tool name without label', () => {
      const message = getToolDisplayMessage({
        input: { toolName: 'find_many_companies', arguments: { limit: 10 } },
        toolName: 'execute_tool',
        isFinished: true,
        displayContext: emptyDisplayContext,
      });

      expect(message).toBe('Ran find_many_companies');
    });

    it('should not recurse infinitely on nested execute_tool payloads', () => {
      const displayContext = makeDisplayContext({
        labels: [['execute_tool', 'Execute Tool']],
      });

      const message = getToolDisplayMessage({
        input: {
          toolName: 'execute_tool',
          arguments: { toolName: 'inner', arguments: {} },
        },
        toolName: 'execute_tool',
        isFinished: true,
        displayContext,
      });

      expect(message).toContain('Ran');
      expect(message).toContain('Execute Tool');
    });

    it('should unwrap execute_tool and use meta-tool handlers for web_search', () => {
      const message = getToolDisplayMessage({
        input: {
          toolName: 'web_search',
          arguments: { query: 'CRM tools' },
        },
        toolName: 'execute_tool',
        isFinished: false,
        displayContext: emptyDisplayContext,
      });

      expect(message).toBe('Searching the web for CRM tools');
    });

    it('should unwrap execute_tool and use meta-tool handlers for code_interpreter', () => {
      const message = getToolDisplayMessage({
        input: {
          toolName: 'code_interpreter',
          arguments: { loadingMessage: 'Analyzing spreadsheet' },
        },
        toolName: 'execute_tool',
        isFinished: false,
        displayContext: emptyDisplayContext,
      });

      expect(message).toBe('Analyzing spreadsheet');
    });

    it('should unwrap execute_tool and use meta-tool handlers for learn_tools', () => {
      const displayContext = makeDisplayContext({
        labels: [['send_email', 'Send Email']],
      });

      const message = getToolDisplayMessage({
        input: {
          toolName: 'learn_tools',
          arguments: { toolNames: ['send_email'] },
        },
        toolName: 'execute_tool',
        isFinished: true,
        displayContext,
      });

      expect(message).toBe('Learned Send Email');
    });
  });
});
