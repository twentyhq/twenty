import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RecordsLink } from '@/ai/components/RecordsLink';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const openViewTargetMock = jest.fn();

jest.mock('@/ai/hooks/useChatTargetNavigation', () => ({
  useChatTargetNavigation: () => ({
    openViewTarget: openViewTargetMock,
  }),
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const renderRecordsLink = (objectMetadataId: string) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

  return render(
    <MemoryRouter>
      <RecordsLink
        objectMetadataId={objectMetadataId}
        displayName="Companies"
      />
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
};

describe('RecordsLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, '', '/objects/companies');
  });

  it('should link to the object records without selecting a view', () => {
    renderRecordsLink(companyObjectMetadataItem.id);

    expect(screen.getByText('Companies').closest('a')).toHaveAttribute(
      'href',
      '/objects/companies',
    );
  });

  it('should open the default records destination from the chat page', () => {
    window.history.pushState({}, '', '/chat');
    renderRecordsLink(companyObjectMetadataItem.id);

    const link = screen.getByText('Companies').closest('a') as HTMLElement;
    fireEvent.mouseDown(link);
    fireEvent.click(link);

    expect(openViewTargetMock).toHaveBeenCalledWith({
      objectNameSingular: companyObjectMetadataItem.nameSingular,
    });
  });

  it('should render plain text for an unknown object metadata id', () => {
    renderRecordsLink('77777777-7777-4777-8777-777777777777');

    expect(screen.getByText('Companies')).toBeInTheDocument();
    expect(screen.queryByTestId('chip')).not.toBeInTheDocument();
  });
});
