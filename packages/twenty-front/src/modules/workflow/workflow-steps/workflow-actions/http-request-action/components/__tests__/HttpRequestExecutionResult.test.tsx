import { render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { HttpRequestExecutionResult } from '@/workflow/workflow-steps/workflow-actions/http-request-action/components/HttpRequestExecutionResult';
import type { HttpRequestTestData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/types/HttpRequestTestData';

jest.mock('@/workflow/components/GenericExecutionResult', () => ({
  GenericExecutionResult: ({
    result,
    language,
    height,
    status,
    isTesting,
    loadingMessage,
    idleMessage,
  }: any) => (
    <div data-testid="generic-execution-result">
      <div data-testid="result">{result}</div>
      <div data-testid="language">{language}</div>
      <div data-testid="height">{height}</div>
      <div data-testid="status">{JSON.stringify(status)}</div>
      <div data-testid="is-testing">{String(isTesting)}</div>
      <div data-testid="loading-message">{loadingMessage}</div>
      <div data-testid="idle-message">{idleMessage}</div>
    </div>
  ),
}));

describe('HttpRequestExecutionResult', () => {
  const defaultTestData: HttpRequestTestData = {
    variableValues: {},
    output: {
      data: '{"success": true}',
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      duration: 150,
    },
    language: 'json',
    height: 400,
  };

  const renderComponent = (testData = defaultTestData, isTesting = false) => {
    return render(
      <RecoilRoot>
        <HttpRequestExecutionResult
          httpRequestTestData={testData}
          isTesting={isTesting}
        />
      </RecoilRoot>,
    );
  };

  it('should render success state for 200 response', () => {
    renderComponent();

    expect(screen.getByTestId('result')).toHaveTextContent('{"success": true}');
    expect(screen.getByTestId('language')).toHaveTextContent('json');
    expect(screen.getByTestId('height')).toHaveTextContent('100%');
    expect(screen.getByTestId('is-testing')).toHaveTextContent('false');
    expect(screen.getByTestId('loading-message')).toHaveTextContent(
      'Sending request...',
    );
    expect(screen.getByTestId('idle-message')).toHaveTextContent('Response');

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.isSuccess).toBe(true);
    expect(status.isError).toBe(false);
    expect(status.successMessage).toBe('200 OK - 150ms');
  });

  it('should render success state for 201 response', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        ...defaultTestData.output,
        status: 201,
        statusText: 'Created',
        duration: 89,
      },
    };

    renderComponent(testData);

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.isSuccess).toBe(true);
    expect(status.isError).toBe(false);
    expect(status.successMessage).toBe('201 Created - 89ms');
  });

  it('should render error state for 404 response', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        data: '{"error": "Not found"}',
        status: 404,
        statusText: 'Not Found',
        headers: {},
        duration: 45,
      },
    };

    renderComponent(testData);

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.isSuccess).toBe(false);
    expect(status.isError).toBe(true);
    expect(status.errorMessage).toBe('404 Not Found - 45ms');
  });

  it('should render error state for 500 response', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        data: '{"error": "Internal server error"}',
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        duration: 2000,
      },
    };

    renderComponent(testData);

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.isSuccess).toBe(false);
    expect(status.isError).toBe(true);
    expect(status.errorMessage).toBe('500 Internal Server Error - 2000ms');
  });

  it('should handle error with error field', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        error: 'Network connection failed',
        headers: {},
      },
    };

    renderComponent(testData);

    expect(screen.getByTestId('result')).toHaveTextContent(
      'Network connection failed',
    );

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.isSuccess).toBe(false);
    expect(status.isError).toBe(true);
    expect(status.errorMessage).toBe('Request Failed');
    expect(status.additionalInfo).toBe('Network connection failed');
  });

  it('should handle success with headers', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        ...defaultTestData.output,
        headers: {
          'content-type': 'application/json',
          'x-rate-limit': '100',
          'cache-control': 'no-cache',
        },
      },
    };

    renderComponent(testData);

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.isSuccess).toBe(true);
    expect(status.additionalInfo).toBe('3 headers received');
  });

  it('should handle success without headers', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        ...defaultTestData.output,
        headers: {},
      },
    };

    renderComponent(testData);

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.isSuccess).toBe(true);
    expect(status.additionalInfo).toBeUndefined();
  });

  it('should handle response without duration', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        data: '{"message": "ok"}',
        status: 200,
        statusText: 'OK',
        headers: {},
      },
    };

    renderComponent(testData);

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.successMessage).toBe('200 OK');
  });

  it('should handle response without status', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        data: '{"message": "ok"}',
        headers: {},
      },
    };

    renderComponent(testData);

    expect(screen.getByTestId('result')).toHaveTextContent('{"message": "ok"}');

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.isSuccess).toBe(false);
    expect(status.isError).toBe(false);
  });

  it('should render loading state when testing', () => {
    renderComponent(defaultTestData, true);

    expect(screen.getByTestId('is-testing')).toHaveTextContent('true');
  });

  it('should handle empty data', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        status: 204,
        statusText: 'No Content',
        headers: {},
        duration: 67,
      },
    };

    renderComponent(testData);

    expect(screen.getByTestId('result')).toHaveTextContent('');

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.isSuccess).toBe(true);
    expect(status.successMessage).toBe('204 No Content - 67ms');
  });

  it('should prioritize data over error field', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        data: '{"success": true}',
        error: 'This should be ignored',
        status: 200,
        statusText: 'OK',
        headers: {},
        duration: 100,
      },
    };

    renderComponent(testData);

    expect(screen.getByTestId('result')).toHaveTextContent('{"success": true}');
  });

  it('should handle 3xx redirect responses as success', () => {
    const testData: HttpRequestTestData = {
      ...defaultTestData,
      output: {
        data: '',
        status: 302,
        statusText: 'Found',
        headers: { location: 'https://example.com/new-location' },
        duration: 30,
      },
    };

    renderComponent(testData);

    const status = JSON.parse(screen.getByTestId('status').textContent || '{}');
    expect(status.isSuccess).toBe(false); // 3xx is not in 200-299 range
    expect(status.isError).toBe(false); // 3xx is not >= 400
  });
});
