import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('WorkflowFieldsMultiSelect', () => {
  it('selects a relation stored by name and keeps it as its join column on toggle', async () => {
    const user = userEvent.setup();
    const handleFieldsChange = jest.fn();

    render(
      <JotaiProvider store={createStore()}>
        <WorkflowFieldsMultiSelect
          label="Fields to update"
          placeholder="Select fields to update"
          objectMetadataItem={getMockObjectMetadataItemOrThrow('person')}
          handleFieldsChange={handleFieldsChange}
          readonly={false}
          defaultFields={['company']}
          actionType="UPDATE_RECORD"
        />
      </JotaiProvider>,
    );

    expect(screen.getByText('Company')).toBeVisible();
    expect(screen.queryByText(/Field not found/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fields to update' }));

    expect(screen.getByRole('button', { name: 'Company' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Job Title' }));

    expect(handleFieldsChange).toHaveBeenLastCalledWith([
      'jobTitle',
      'companyId',
    ]);
  });
});
