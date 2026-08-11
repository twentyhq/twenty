import { render, screen } from '@testing-library/react';

import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';

jest.mock('@/ai/components/RecordLink', () => ({
  RecordLink: ({
    displayName,
    objectNameSingular,
    recordId,
  }: {
    displayName: string;
    objectNameSingular: string;
    recordId: string;
  }) => (
    <a data-testid="record-link" href={`/${objectNameSingular}/${recordId}`}>
      {displayName}
    </a>
  ),
}));

jest.mock('@/ai/components/ObjectMetadataLink', () => ({
  ObjectMetadataLink: ({
    displayName,
    objectNameSingular,
  }: {
    displayName: string;
    objectNameSingular: string;
  }) => (
    <a data-testid="object-link" href={`/objects/${objectNameSingular}`}>
      {displayName}
    </a>
  ),
}));

jest.mock('@/ai/components/FieldMetadataLink', () => ({
  FieldMetadataLink: ({
    displayName,
    fieldMetadataItemId,
  }: {
    displayName: string;
    fieldMetadataItemId: string;
  }) => (
    <a data-testid="field-link" href={`/fields/${fieldMetadataItemId}`}>
      {displayName}
    </a>
  ),
}));

jest.mock('@/ai/components/ViewLink', () => ({
  ViewLink: ({
    displayName,
    viewId,
  }: {
    displayName: string;
    viewId: string;
  }) => (
    <a data-testid="view-link" href={`/views/${viewId}`}>
      {displayName}
    </a>
  ),
}));

describe('TextWithChatReferences', () => {
  it('should render plain text without references as-is', () => {
    render(<TextWithChatReferences text="Which company should we contact?" />);

    expect(
      screen.getByText('Which company should we contact?'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('record-link')).not.toBeInTheDocument();
  });

  it('should replace record references with RecordLink chips', () => {
    render(
      <TextWithChatReferences text="Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next" />,
    );

    expect(screen.getByTestId('record-link')).toHaveTextContent('Acme');
    expect(screen.getByText(/Contact/)).toHaveTextContent('Contact Acme next');
    expect(screen.queryByText(/\[\[record:company:/)).not.toBeInTheDocument();
  });

  it('should replace multiple record references in option-style labels', () => {
    render(
      <TextWithChatReferences text="Merge [[person:11111111-1111-1111-1111-111111111111:Alice]] into [[person:22222222-2222-2222-2222-222222222222:Bob]]" />,
    );

    const recordLinks = screen.getAllByTestId('record-link');

    expect(recordLinks).toHaveLength(2);
    expect(recordLinks[0]).toHaveTextContent('Alice');
    expect(recordLinks[1]).toHaveTextContent('Bob');
    expect(screen.queryByText(/\[\[/)).not.toBeInTheDocument();
  });

  it('should chip labels that contain backticks and colons', () => {
    render(
      <TextWithChatReferences text="See [[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow `UPDATE_RECORD` step]] then [[record:person:c1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane]]" />,
    );

    const recordLinks = screen.getAllByTestId('record-link');

    expect(recordLinks).toHaveLength(2);
    expect(recordLinks[0]).toHaveTextContent('Workflow `UPDATE_RECORD` step');
    expect(recordLinks[1]).toHaveTextContent('Doe: Jane');
    expect(screen.queryByText(/\[\[record:/)).not.toBeInTheDocument();
  });

  it('should render a reference using a retired closing tag as plain text', () => {
    render(
      <TextWithChatReferences text="Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]] next" />,
    );

    expect(screen.queryByTestId('record-link')).not.toBeInTheDocument();
    expect(screen.getByText(/Contact/)).toHaveTextContent(
      'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]] next',
    );
  });

  it('should route each reference kind to its own chip', () => {
    render(
      <TextWithChatReferences text="The [[view:44444444-4444-4444-4444-444444444444:Pipeline]] view of [[object:partner:Partners]] groups [[record:person:11111111-1111-1111-1111-111111111111:Alice]] by [[field:33333333-3333-3333-3333-333333333333:Stage]]" />,
    );

    expect(screen.getByTestId('view-link')).toHaveAttribute(
      'href',
      '/views/44444444-4444-4444-4444-444444444444',
    );
    expect(screen.getByTestId('object-link')).toHaveAttribute(
      'href',
      '/objects/partner',
    );
    expect(screen.getByTestId('record-link')).toHaveTextContent('Alice');
    expect(screen.getByTestId('field-link')).toHaveAttribute(
      'href',
      '/fields/33333333-3333-3333-3333-333333333333',
    );
  });
});
