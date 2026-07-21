import { render, screen } from '@testing-library/react';

import { TextWithRecordLinks } from '@/ai/components/TextWithRecordLinks';

jest.mock('@/ai/components/RecordLink', () => ({
  RECORD_REFERENCE_REGEX:
    /\[\[(?:record:)?([a-zA-Z]+):([a-f0-9-]+):([^\]]+)\]\]/g,
  parseRecordReference: (match: string) => {
    const regex = /\[\[(?:record:)?([a-zA-Z]+):([a-f0-9-]+):([^\]]+)\]\]/;
    const result = regex.exec(match);

    if (!result) {
      return null;
    }

    return {
      objectNameSingular: result[1],
      recordId: result[2],
      displayName: result[3],
    };
  },
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

describe('TextWithRecordLinks', () => {
  it('should render plain text without record references as-is', () => {
    render(<TextWithRecordLinks text="Which company should we contact?" />);

    expect(
      screen.getByText('Which company should we contact?'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('record-link')).not.toBeInTheDocument();
  });

  it('should replace record references with RecordLink chips', () => {
    render(
      <TextWithRecordLinks text="Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next" />,
    );

    expect(screen.getByTestId('record-link')).toHaveTextContent('Acme');
    expect(screen.getByText(/Contact/)).toHaveTextContent('Contact Acme next');
    expect(screen.queryByText(/\[\[record:company:/)).not.toBeInTheDocument();
  });

  it('should replace multiple record references in option-style labels', () => {
    render(
      <TextWithRecordLinks text="Merge [[person:11111111-1111-1111-1111-111111111111:Alice]] into [[person:22222222-2222-2222-2222-222222222222:Bob]]" />,
    );

    const recordLinks = screen.getAllByTestId('record-link');

    expect(recordLinks).toHaveLength(2);
    expect(recordLinks[0]).toHaveTextContent('Alice');
    expect(recordLinks[1]).toHaveTextContent('Bob');
    expect(screen.queryByText(/\[\[/)).not.toBeInTheDocument();
  });
});
