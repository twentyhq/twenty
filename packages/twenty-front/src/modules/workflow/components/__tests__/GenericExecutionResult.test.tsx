/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import {
  ExecutionStatus,
  GenericExecutionResult,
} from '@/workflow/components/GenericExecutionResult';

const mockTheme = {
  icon: { size: { md: 16 } },
  spacing: jest.fn((multiplier: number) => `${multiplier * 4}px`),
  font: {
    size: { md: '14px', sm: '12px' },
    color: { secondary: 'rgb(102, 102, 102)', tertiary: 'rgb(153, 153, 153)' },
  },
  color: { turquoise: 'rgb(0, 212, 170)', red: 'rgb(255, 0, 0)' },
};

jest.mock('@emotion/react', () => ({
  useTheme: () => mockTheme,
}));

const mockCopyText = jest.fn();
jest.mock(
  '@/object-record/record-field/components/LightCopyIconButton',
  () => ({
    LightCopyIconButton: ({ copyText }: { copyText: string }) => {
      mockCopyText(copyText);
      return <button data-testid="copy-button">Copy</button>;
    },
  }),
);

describe('GenericExecutionResult', () => {
  const defaultProps = {
    result: 'Test result output',
    language: 'json' as 'plaintext' | 'json',
    height: '200px',
    status: {
      isSuccess: false,
      isError: false,
    },
    isTesting: false,
    loadingMessage: 'Processing...',
    idleMessage: 'Output',
  };

  const renderComponent = (props: Partial<typeof defaultProps> = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return render(
      <RecoilRoot>
        <GenericExecutionResult
          result={mergedProps.result}
          language={mergedProps.language}
          height={mergedProps.height}
          status={mergedProps.status}
          isTesting={mergedProps.isTesting}
          loadingMessage={mergedProps.loadingMessage}
          idleMessage={mergedProps.idleMessage}
        />
      </RecoilRoot>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render idle state by default', () => {
    renderComponent();

    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(screen.getByText('Test result output')).toBeInTheDocument();
    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
  });

  it('should render custom idle message', () => {
    renderComponent({ idleMessage: 'Custom Idle Message' });

    expect(screen.getByText('Custom Idle Message')).toBeInTheDocument();
  });

  it('should render success state', () => {
    const successStatus: ExecutionStatus = {
      isSuccess: true,
      isError: false,
      successMessage: '200 OK - 150ms',
    };

    renderComponent({ status: successStatus });

    expect(screen.getByText('200 OK - 150ms')).toBeInTheDocument();
  });

  it('should render success state with additional info', () => {
    const successStatus: ExecutionStatus = {
      isSuccess: true,
      isError: false,
      successMessage: '200 OK - 150ms',
      additionalInfo: '5 headers received',
    };

    renderComponent({ status: successStatus });

    expect(screen.getByText('200 OK - 150ms')).toBeInTheDocument();
    expect(screen.getByText('5 headers received')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const errorStatus: ExecutionStatus = {
      isSuccess: false,
      isError: true,
      errorMessage: '500 Error - 200ms',
    };

    renderComponent({ status: errorStatus });

    expect(screen.getByText('500 Error - 200ms')).toBeInTheDocument();
  });

  it('should render error state with additional info', () => {
    const errorStatus: ExecutionStatus = {
      isSuccess: false,
      isError: true,
      errorMessage: '404 Not Found - 100ms',
      additionalInfo: 'Resource not found',
    };

    renderComponent({ status: errorStatus });

    expect(screen.getByText('404 Not Found - 100ms')).toBeInTheDocument();
    expect(screen.getByText('Resource not found')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    renderComponent({ isTesting: true });

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('should render custom loading message', () => {
    renderComponent({
      isTesting: true,
      loadingMessage: 'Sending request...',
    });

    expect(screen.getByText('Sending request...')).toBeInTheDocument();
  });

  it('should handle different languages', () => {
    renderComponent({ language: 'plaintext' });

    expect(screen.getByText('Test result output')).toBeInTheDocument();
  });

  it('should handle different heights', () => {
    const { container } = renderComponent({ height: '400px' });

    // The height is passed to CodeEditor, so we can't directly test it
    // but we can verify the component renders without errors
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should pass result to copy button', () => {
    const testResult = 'Test copy content';
    renderComponent({ result: testResult });

    expect(mockCopyText).toHaveBeenCalledWith(testResult);
  });

  it('should handle empty result', () => {
    renderComponent({ result: '' });

    expect(mockCopyText).toHaveBeenCalledWith('');
  });

  it('should prioritize success state over error state', () => {
    const mixedStatus: ExecutionStatus = {
      isSuccess: true,
      isError: true,
      successMessage: 'Success message',
      errorMessage: 'Error message',
    };

    renderComponent({ status: mixedStatus });

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
  });

  it('should prioritize loading state over success/error states', () => {
    const successStatus: ExecutionStatus = {
      isSuccess: true,
      isError: false,
      successMessage: 'Success message',
    };

    renderComponent({
      status: successStatus,
      isTesting: true,
      loadingMessage: 'Loading...',
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });
});
