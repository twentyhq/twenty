import {
  WorkflowFormAction,
  WorkflowHttpRequestAction,
  WorkflowSendEmailAction,
} from '@/workflow/types/Workflow';
import {
  workflowFormActionSettingsSchema,
  workflowHttpRequestActionSettingsSchema,
  workflowSendEmailActionSettingsSchema,
} from '@/workflow/validation-schemas/workflowSchema';
import { renderHook } from '@testing-library/react';
import { FieldMetadataType } from 'twenty-shared/types';
import { useWorkflowActionHeader } from '../useWorkflowActionHeader';

jest.mock('../useActionIconColorOrThrow', () => ({
  useActionIconColorOrThrow: jest.fn().mockReturnValue('blue'),
}));

jest.mock('../useActionHeaderTypeOrThrow', () => ({
  useActionHeaderTypeOrThrow: jest.fn().mockReturnValue('Action'),
}));

jest.mock('../../utils/getActionIcon', () => ({
  getActionIcon: jest.fn().mockReturnValue('IconHttp'),
}));

const mockGetIcon = jest.fn().mockReturnValue('IconComponent');
jest.mock('twenty-ui/display', () => ({
  useIcons: () => ({
    getIcon: mockGetIcon,
  }),
}));

describe('useWorkflowActionHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when action name is not defined', () => {
    it('should return default title', () => {
      const action = {
        id: '1',
        name: '',
        type: 'HTTP_REQUEST',
        settings: workflowHttpRequestActionSettingsSchema.parse({
          input: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            body: {},
          },
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
        }),
        valid: true,
      } satisfies WorkflowHttpRequestAction;

      const { result } = renderHook(() =>
        useWorkflowActionHeader({
          action,
          defaultTitle: 'HTTP Request',
        }),
      );

      expect(result.current.headerTitle).toBe('HTTP Request');
      expect(result.current.headerIcon).toBe('IconHttp');
      expect(result.current.headerIconColor).toBe('blue');
      expect(result.current.headerType).toBe('Action');
      expect(result.current.getIcon).toBe(mockGetIcon);
    });
  });

  describe('when action name is defined', () => {
    it('should return the action name', () => {
      const action = {
        id: '1',
        name: 'Test Action',
        type: 'HTTP_REQUEST',
        settings: workflowHttpRequestActionSettingsSchema.parse({
          input: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            body: {},
          },
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
        }),
        valid: true,
      } satisfies WorkflowHttpRequestAction;

      const { result } = renderHook(() =>
        useWorkflowActionHeader({
          action,
          defaultTitle: 'HTTP Request',
        }),
      );

      expect(result.current.headerTitle).toBe('Test Action');
      expect(result.current.headerIcon).toBe('IconHttp');
      expect(result.current.headerIconColor).toBe('blue');
      expect(result.current.headerType).toBe('Action');
      expect(result.current.getIcon).toBe(mockGetIcon);
    });
  });

  describe('when action type is defined', () => {
    it('should return default title for HTTP request action', () => {
      const action = {
        id: '1',
        name: '',
        type: 'HTTP_REQUEST',
        settings: workflowHttpRequestActionSettingsSchema.parse({
          input: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            body: {},
          },
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
        }),
        valid: true,
      } satisfies WorkflowHttpRequestAction;

      const { result } = renderHook(() =>
        useWorkflowActionHeader({
          action,
          defaultTitle: 'HTTP Request',
        }),
      );

      expect(result.current.headerTitle).toBe('HTTP Request');
      expect(result.current.headerIcon).toBe('IconHttp');
      expect(result.current.headerIconColor).toBe('blue');
      expect(result.current.headerType).toBe('Action');
      expect(result.current.getIcon).toBe(mockGetIcon);
    });

    it('should return default title for form action', () => {
      const action = {
        id: '1',
        name: '',
        type: 'FORM',
        settings: workflowFormActionSettingsSchema.parse({
          input: [
            {
              id: '1',
              name: 'field1',
              label: 'Field 1',
              type: FieldMetadataType.TEXT,
              required: false,
              settings: {},
            },
          ],
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
        }),
        valid: true,
      } satisfies WorkflowFormAction;

      const { result } = renderHook(() =>
        useWorkflowActionHeader({
          action,
          defaultTitle: 'Form',
        }),
      );

      expect(result.current.headerTitle).toBe('Form');
      expect(result.current.headerIcon).toBe('IconHttp');
      expect(result.current.headerIconColor).toBe('blue');
      expect(result.current.headerType).toBe('Action');
      expect(result.current.getIcon).toBe(mockGetIcon);
    });

    it('should return default title for email action', () => {
      const action = {
        id: '1',
        name: '',
        type: 'SEND_EMAIL',
        settings: workflowSendEmailActionSettingsSchema.parse({
          input: {
            connectedAccountId: '1',
            email: 'test@example.com',
            subject: 'Test Subject',
            body: 'Test Body',
          },
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
        }),
        valid: true,
      } satisfies WorkflowSendEmailAction;

      const { result } = renderHook(() =>
        useWorkflowActionHeader({
          action,
          defaultTitle: 'Email',
        }),
      );

      expect(result.current.headerTitle).toBe('Email');
      expect(result.current.headerIcon).toBe('IconHttp');
      expect(result.current.headerIconColor).toBe('blue');
      expect(result.current.headerType).toBe('Action');
      expect(result.current.getIcon).toBe(mockGetIcon);
    });
  });
});
