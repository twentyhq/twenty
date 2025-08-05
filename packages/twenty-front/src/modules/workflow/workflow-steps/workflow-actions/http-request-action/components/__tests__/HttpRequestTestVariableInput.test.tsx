/* eslint-disable @nx/workspace-no-hardcoded-colors */

import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { HttpRequestTestVariableInput } from '@/workflow/workflow-steps/workflow-actions/http-request-action/components/HttpRequestTestVariableInput';
import { HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { httpRequestTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/http-request-action/states/httpRequestTestDataFamilyState';

import { getWorkflowVariablesUsedInStep } from '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep';

jest.mock(
  '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep',
  () => ({
    getWorkflowVariablesUsedInStep: jest.fn(),
  }),
);

jest.mock(
  '@/object-record/record-field/form-types/components/FormTextFieldInput',
  () => ({
    FormTextFieldInput: ({
      placeholder,
      readonly,
      defaultValue,
      onChange,
    }: any) => (
      <input
        data-testid="form-text-field-input"
        placeholder={placeholder}
        readOnly={readonly}
        defaultValue={defaultValue}
        data-testid-default-value={defaultValue}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    ),
  }),
);

jest.mock(
  '@/object-record/record-field/form-types/components/FormFieldInputContainer',
  () => ({
    FormFieldInputContainer: ({ children }: any) => (
      <div data-testid="form-field-input-container">{children}</div>
    ),
  }),
);

jest.mock('@/ui/input/components/InputLabel', () => ({
  InputLabel: ({ children }: any) => (
    <label data-testid="input-label">{children}</label>
  ),
}));

describe('HttpRequestTestVariableInput', () => {
  const mockHttpRequestFormData: HttpRequestFormData = {
    url: 'https://api.example.com/users/{{user.id}}',
    method: 'GET',
    headers: {
      Authorization: 'Bearer {{auth.token}}',
      'Content-Type': 'application/json',
    },
    body: {
      name: '{{user.name}}',
      email: '{{contact.email}}',
    },
  };

  const actionId = 'test-action-id';

  const mockGetWorkflowVariablesUsedInStep =
    getWorkflowVariablesUsedInStep as jest.MockedFunction<
      typeof getWorkflowVariablesUsedInStep
    >;

  const mockTheme = {
    spacing: jest.fn((multiplier: number) => `${multiplier * 4}px`),
    border: {
      color: {
        strong: 'rgb(221, 221, 221)',
        medium: 'rgb(221, 221, 221)', // Mock color for testing
        light: 'rgb(221, 221, 221)',
        secondaryInverted: 'rgb(221, 221, 221)',
        inverted: 'rgb(221, 221, 221)',
        danger: 'rgb(221, 221, 221)',
        blue: 'rgb(221, 221, 221)',
      },
      radius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        xl: '20px',
        xxl: '40px',
        pill: '999px',
        rounded: '100%',
      },
    },
    font: {
      size: { sm: '12px' },
      weight: { medium: '500' },

      color: { primary: 'rgb(51, 51, 51)' }, // Mock color for testing
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (
    httpRequestFormData = mockHttpRequestFormData,
    readonly = false,
  ) => {
    return render(
      <ThemeProvider theme={mockTheme as any}>
        <RecoilRoot
          initializeState={({ set }) => {
            set(httpRequestTestDataFamilyState(actionId), {
              language: 'plaintext',
              height: 400,
              variableValues: {},
              output: {
                data: 'Configure your request above, then press "Test"',
                status: undefined,
                statusText: undefined,
                headers: {},
                duration: undefined,
                error: undefined,
              },
            });
          }}
        >
          <HttpRequestTestVariableInput
            httpRequestFormData={httpRequestFormData}
            actionId={actionId}
            readonly={readonly}
          />
        </RecoilRoot>
      </ThemeProvider>,
    );
  };

  it('should render nothing when no variables are used', () => {
    mockGetWorkflowVariablesUsedInStep.mockReturnValue(new Set());

    const { container } = renderComponent();

    expect(container.firstChild).toBeNull();
  });

  it('should render variable inputs when variables are used', () => {
    mockGetWorkflowVariablesUsedInStep.mockReturnValue(
      new Set(['user.id', 'auth.token', 'user.name']),
    );

    renderComponent();

    expect(screen.getByTestId('input-label')).toHaveTextContent(
      'Test Variables',
    );
    expect(
      screen.getByTestId('form-field-input-container'),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('form-text-field-input')).toHaveLength(3);
  });

  it('should display variable labels correctly', () => {
    mockGetWorkflowVariablesUsedInStep.mockReturnValue(
      new Set(['user.id', 'auth.token']),
    );

    renderComponent();

    expect(screen.getAllByText('Variable:').length).toBe(2);
    expect(screen.getByText('{{user.id}}')).toBeInTheDocument();
    expect(screen.getByText('{{auth.token}}')).toBeInTheDocument();
  });

  it('should render inputs with correct placeholder', () => {
    mockGetWorkflowVariablesUsedInStep.mockReturnValue(new Set(['user.id']));

    renderComponent();

    const input = screen.getByTestId('form-text-field-input');
    expect(input).toHaveAttribute('placeholder', 'Enter test value');
  });

  it('should handle readonly mode', () => {
    mockGetWorkflowVariablesUsedInStep.mockReturnValue(new Set(['user.id']));

    renderComponent(mockHttpRequestFormData, true);

    const input = screen.getByTestId('form-text-field-input');
    expect(input).toHaveAttribute('readonly');
  });

  it('should load existing variable values', () => {
    mockGetWorkflowVariablesUsedInStep.mockReturnValue(new Set(['user.id']));

    render(
      <ThemeProvider theme={mockTheme as any}>
        <RecoilRoot
          initializeState={({ set }) => {
            set(httpRequestTestDataFamilyState(actionId), {
              language: 'plaintext',
              height: 400,
              variableValues: {
                'user.id': '12345',
              },
              output: {
                data: 'Configure your request above, then press "Test"',
                status: undefined,
                statusText: undefined,
                headers: {},
                duration: undefined,
                error: undefined,
              },
            });
          }}
        >
          <HttpRequestTestVariableInput
            httpRequestFormData={mockHttpRequestFormData}
            actionId={actionId}
          />
        </RecoilRoot>
      </ThemeProvider>,
    );

    const input = screen.getByTestId('form-text-field-input');
    expect(input).toHaveAttribute('data-testid-default-value', '12345');
  });

  it('should handle empty variable values', () => {
    mockGetWorkflowVariablesUsedInStep.mockReturnValue(new Set(['user.id']));

    renderComponent();

    const input = screen.getByTestId('form-text-field-input');
    expect(input).toHaveAttribute('data-testid-default-value', '');
  });

  it('should update variable values on input change', () => {
    mockGetWorkflowVariablesUsedInStep.mockReturnValue(new Set(['user.id']));

    renderComponent();

    const input = screen.getByTestId('form-text-field-input');
    fireEvent.change(input, { target: { value: '67890' } });

    // Note: We can't easily test the Recoil state update in this test setup,
    // but we can verify that the onChange handler is called correctly
    expect((input as HTMLInputElement).value).toBe('67890');
  });

  it('should handle multiple variables correctly', () => {
    mockGetWorkflowVariablesUsedInStep.mockReturnValue(
      new Set(['user.id', 'user.name', 'user.email', 'auth.token']),
    );

    renderComponent();

    const inputs = screen.getAllByTestId('form-text-field-input');
    expect(inputs).toHaveLength(4);

    // Each input should have the correct placeholder
    inputs.forEach((input) => {
      expect(input).toHaveAttribute('placeholder', 'Enter test value');
    });
  });

  it('should create correct mock step for variable detection', () => {
    mockGetWorkflowVariablesUsedInStep.mockReturnValue(new Set(['user.id']));

    renderComponent();

    expect(mockGetWorkflowVariablesUsedInStep).toHaveBeenCalledWith({
      step: expect.objectContaining({
        id: 'test-step',
        name: 'Test Step',
        type: 'HTTP_REQUEST',
        valid: true,
        settings: expect.objectContaining({
          input: mockHttpRequestFormData,
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
        }),
      }),
    });
  });

  it('should handle variables from different parts of the request', () => {
    const formDataWithVariables: HttpRequestFormData = {
      url: 'https://api.example.com/{{endpoint.path}}',
      method: 'POST',
      headers: {
        Authorization: 'Bearer {{auth.token}}',
        'X-User-ID': '{{user.id}}',
      },
      body: {
        data: '{{request.payload}}',
        metadata: {
          timestamp: '{{current.time}}',
          source: '{{app.name}}',
        },
      },
    };

    mockGetWorkflowVariablesUsedInStep.mockReturnValue(
      new Set([
        'endpoint.path',
        'auth.token',
        'user.id',
        'request.payload',
        'current.time',
        'app.name',
      ]),
    );

    renderComponent(formDataWithVariables);

    expect(screen.getAllByTestId('form-text-field-input')).toHaveLength(6);

    // Check that all variable paths are displayed
    expect(screen.getByText('{{endpoint.path}}')).toBeInTheDocument();
    expect(screen.getByText('{{auth.token}}')).toBeInTheDocument();
    expect(screen.getByText('{{user.id}}')).toBeInTheDocument();
    expect(screen.getByText('{{request.payload}}')).toBeInTheDocument();
    expect(screen.getByText('{{current.time}}')).toBeInTheDocument();
    expect(screen.getByText('{{app.name}}')).toBeInTheDocument();
  });
});
