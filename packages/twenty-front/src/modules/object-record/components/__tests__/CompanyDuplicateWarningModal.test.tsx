import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CompanyDuplicateWarningModal } from '@/object-record/components/CompanyDuplicateWarningModal';

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({
    closeModal: jest.fn(),
    openModal: jest.fn(),
  }),
}));

jest.mock('@/object-record/components/RecordChip', () => ({
  RecordChip: ({ record }: { record: { name: string } }) => (
    <div>{record.name}</div>
  ),
}));

jest.mock('@/ui/layout/modal/components/Modal', () => {
  const Modal = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal">{children}</div>
  );

  Modal.Content = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  Modal.Footer = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );

  return {
    Modal,
  };
});

describe('CompanyDuplicateWarningModal', () => {
  it('renders duplicate company name and domain details', () => {
    render(
      <CompanyDuplicateWarningModal
        duplicates={[
          {
            domainName: 'acme.com',
            id: 'duplicate-company-id',
            name: 'Acme Corp',
          } as any,
        ]}
        isOpen={true}
        onCancel={jest.fn()}
        onContinueAnyway={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Potential duplicate companies' }),
    ).toBeVisible();
    expect(screen.getByText('Acme Corp')).toBeVisible();
    expect(screen.getByText('acme.com')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Continue anyway' }),
    ).toBeVisible();
  });

  it('renders an error state with retry and cancel actions', async () => {
    const onCancel = jest.fn();
    const onRetry = jest.fn();
    const user = userEvent.setup();

    render(
      <CompanyDuplicateWarningModal
        duplicates={[]}
        errorMessage="Unable to check for duplicates"
        isOpen={true}
        onCancel={onCancel}
        onContinueAnyway={jest.fn()}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('Unable to check for duplicates')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Continue anyway' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
