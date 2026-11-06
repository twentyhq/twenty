// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    post = post;
  },
}));
vi.mock('twenty-sdk/define', () => ({
  defineFrontComponent: (config: unknown) => config,
}));

import { Research } from 'src/components/research';

describe('CompanyEnrich research panel', () => {
  beforeEach(() => post.mockReset());
  afterEach(cleanup);

  it('does not call paid endpoints until Run research is selected and preserves false', async () => {
    post.mockResolvedValue({ success: true, data: { name: 'Example' } });
    render(<Research />);
    fireEvent.change(screen.getByLabelText('Company domain'), {
      target: { value: 'example.com' },
    });
    fireEvent.click(
      screen.getByLabelText('Wait for enrichment of new domains'),
    );
    expect(post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Run research' }));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/s/companyenrich/enrich-company', {
        domain: 'example.com',
        waitForEnrichment: false,
      }),
    );
    expect(
      await screen.findByRole('region', { name: 'CompanyEnrich results' }),
    ).toBeDefined();
  });

  it('exposes all sixteen research operations and two explicit CRM actions', () => {
    render(<Research />);
    expect(
      screen
        .getAllByRole('option')
        .map((option) => (option as HTMLOptionElement).value),
    ).toEqual([
      'enrich-company',
      'enrich-company-properties',
      'enrich-companies-batch',
      'get-company',
      'search-companies',
      'similar-companies',
      'count-companies',
      'count-similar-companies',
      'company-workforce',
      'search-people',
      'lookup-person',
      'get-person',
      'autocomplete-companies',
      'person-education',
      'preview-companies',
      'preview-similar-companies',
      'enrich-company-record',
      'enrich-person-record',
    ]);
    fireEvent.change(screen.getByLabelText('Action'), {
      target: { value: 'enrich-person-record' },
    });
    expect(screen.getByLabelText('Twenty record ID')).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Enrich and save profile' }),
    ).toBeDefined();
    expect(post).not.toHaveBeenCalled();
  });

  it('uses the current selected record after the panel selection changes', async () => {
    post.mockResolvedValue({ success: true });
    const { rerender } = render(
      <Research initialAction="enrich-company-record" recordId="record-a" />,
    );
    rerender(
      <Research initialAction="enrich-company-record" recordId="record-b" />,
    );
    expect(screen.getByLabelText('Twenty record ID')).toHaveProperty(
      'value',
      'record-b',
    );
    expect(screen.getByLabelText('Twenty record ID')).toHaveProperty(
      'readOnly',
      true,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Enrich and save profile' }),
    );
    await waitFor(() =>
      expect(post).toHaveBeenCalledExactlyOnceWith(
        '/s/companyenrich/enrich-company-record',
        { recordId: 'record-b' },
      ),
    );
  });

  it('keeps a manually entered global record ID editable', () => {
    render(<Research initialAction="enrich-person-record" />);
    fireEvent.change(screen.getByLabelText('Twenty record ID'), {
      target: { value: 'manual-record' },
    });
    expect(screen.getByLabelText('Twenty record ID')).toHaveProperty(
      'value',
      'manual-record',
    );
    expect(screen.getByLabelText('Twenty record ID')).toHaveProperty(
      'readOnly',
      false,
    );
  });

  it('preserves person IDs as text and surfaces a safe provider error without replay', async () => {
    post.mockResolvedValue({
      success: false,
      error: 'Your CompanyEnrich account needs more credits.',
    });
    render(<Research />);
    fireEvent.change(screen.getByLabelText('Action'), {
      target: { value: 'get-person' },
    });
    fireEvent.change(screen.getByLabelText('CompanyEnrich ID'), {
      target: { value: '9223372036854775806' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run research' }));
    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Your CompanyEnrich account needs more credits.',
    );
    expect(post).toHaveBeenCalledExactlyOnceWith(
      '/s/companyenrich/get-person',
      { id: '9223372036854775806' },
    );
  });

  it('rejects malformed JSON before calling a search endpoint', async () => {
    render(<Research />);
    fireEvent.change(screen.getByLabelText('Action'), {
      target: { value: 'search-companies' },
    });
    fireEvent.change(screen.getByLabelText('Request body'), {
      target: { value: '{' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run research' }));
    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Enter a valid JSON request body.',
    );
    expect(post).not.toHaveBeenCalled();
  });
});
