import { WorkflowVariablesDropdownSteps } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownSteps';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: jest.fn() }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

const STEPS: StepOutputSchemaV2[] = [
  {
    id: 'trigger',
    name: 'Manual trigger',
    type: 'MANUAL',
    outputSchema: {
      companyName: {
        isLeaf: true,
        label: 'Company name',
        type: 'string',
        value: '',
      },
    },
  },
  {
    id: 'code',
    name: 'Run code',
    type: 'CODE',
    outputSchema: {
      result: {
        isLeaf: false,
        type: 'object',
        label: 'Result',
        value: {
          companyName: {
            isLeaf: true,
            label: 'Company name',
            type: 'string',
            value: '',
          },
        },
      },
    },
  },
];

const renderDropdown = () => {
  const onSelect = jest.fn();
  const onVariableSelect = jest.fn();
  render(
    <I18nProvider i18n={i18n}>
      <WorkflowVariablesDropdownSteps
        dropdownId="variables"
        steps={STEPS}
        onSelect={onSelect}
        onVariableSelect={onVariableSelect}
      />
    </I18nProvider>,
  );
  return { onSelect, onVariableSelect };
};

describe('WorkflowVariablesDropdownSteps', () => {
  it('keeps the normal step list until a search is entered', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderDropdown();
    expect(screen.queryByText('Company name')).not.toBeInTheDocument();
    await user.click(screen.getByText('Run code'));
    expect(onSelect).toHaveBeenCalledWith('code');
  });

  it('selects a nested field directly and identifies its source step', async () => {
    const user = userEvent.setup();
    const { onVariableSelect, onSelect } = renderDropdown();
    await user.type(
      screen.getByPlaceholderText('Search steps and fields'),
      ' COMPANY NAME ',
    );
    expect(screen.getAllByText('Company name')).toHaveLength(2);
    expect(
      screen.getByText('Run code / Result', { exact: false }),
    ).toBeInTheDocument();
    await user.click(screen.getAllByText('Company name')[1]);
    expect(onVariableSelect).toHaveBeenCalledWith(
      '{{code.result.companyName}}',
      'code',
      false,
    );
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('can browse a matching nested container', async () => {
    const user = userEvent.setup();
    const { onSelect, onVariableSelect } = renderDropdown();
    await user.type(
      screen.getByPlaceholderText('Search steps and fields'),
      'result',
    );
    await user.click(screen.getByText('Result'));
    expect(onSelect).toHaveBeenCalledWith('code', ['result']);
    expect(onVariableSelect).not.toHaveBeenCalled();
  });

  it('selects a whole record from root search', async () => {
    const user = userEvent.setup();
    const onVariableSelect = jest.fn();
    render(
      <I18nProvider i18n={i18n}>
        <WorkflowVariablesDropdownSteps
          dropdownId="variables"
          steps={[
            {
              id: 'trigger',
              name: 'Record created',
              type: 'DATABASE_EVENT',
              outputSchema: {
                _outputSchemaType: 'RECORD',
                object: { label: 'Company', objectMetadataId: 'company' },
                fields: {},
              },
            },
          ]}
          onSelect={jest.fn()}
          onVariableSelect={onVariableSelect}
          shouldDisplayRecordObjects
        />
      </I18nProvider>,
    );

    await user.type(
      screen.getByPlaceholderText('Search steps and fields'),
      'company',
    );
    await user.click(screen.getByText('Company'));
    expect(onVariableSelect).toHaveBeenCalledWith(
      '{{trigger.id}}',
      'trigger',
      true,
    );
  });

  it('matches step names case-insensitively and restores all steps when cleared', async () => {
    const user = userEvent.setup();
    renderDropdown();
    const searchInput = screen.getByPlaceholderText('Search steps and fields');
    await user.type(searchInput, 'RUN CODE');
    expect(screen.getByText('Run code')).toBeInTheDocument();
    expect(screen.queryByText('Manual trigger')).not.toBeInTheDocument();
    await user.clear(searchInput);
    expect(screen.getByText('Manual trigger')).toBeInTheDocument();
  });

  it('shows an empty state when no step or field matches', async () => {
    const user = userEvent.setup();
    renderDropdown();
    await user.type(
      screen.getByPlaceholderText('Search steps and fields'),
      'unavailable',
    );
    expect(screen.getByText('No variables available')).toBeInTheDocument();
  });
});
