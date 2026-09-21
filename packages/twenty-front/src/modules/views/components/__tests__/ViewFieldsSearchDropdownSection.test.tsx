import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ViewFieldsSearchDropdownSection } from '@/views/components/ViewFieldsSearchDropdownSection';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { ViewType } from '@/views/types/ViewType';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockChangeFieldVisibility = jest.fn();

jest.mock('@/object-metadata/hooks/useActiveFieldMetadataItems', () => ({
  useActiveFieldMetadataItems: () => ({
    activeFieldMetadataItems: [{ id: 'name', label: 'Name' }],
  }),
}));

jest.mock(
  '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem',
  () => ({
    getLabelIdentifierFieldMetadataItem: () => undefined,
  }),
);

jest.mock(
  '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard',
  () => ({
    useObjectOptionsForBoard: () => ({
      handleBoardFieldVisibilityChange: mockChangeFieldVisibility,
    }),
  }),
);

jest.mock(
  '@/object-record/record-field/hooks/useChangeRecordFieldVisibility',
  () => ({
    useChangeRecordFieldVisibility: () => ({
      changeRecordFieldVisibility: mockChangeFieldVisibility,
    }),
  }),
);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: () => [],
  }),
);

describe('field visibility menu actions', () => {
  it('activates the trailing button by mouse and keyboard while leaving the row inactive', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider i18n={i18n}>
        <ObjectOptionsDropdownContext.Provider
          value={{
            objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
            viewType: ViewType.TABLE,
            recordIndexId: 'field-visibility-test',
            dropdownId: 'field-visibility-test',
            currentContentId: null,
            onContentChange: jest.fn(),
            resetContent: jest.fn(),
          }}
        >
          <ViewFieldsSearchDropdownSection searchInput="" />
        </ObjectOptionsDropdownContext.Provider>
      </I18nProvider>,
    );

    await user.click(screen.getByText('Name'));
    expect(mockChangeFieldVisibility).not.toHaveBeenCalled();

    await user.hover(screen.getByText('Name'));
    await user.click(screen.getByRole('button', { name: 'Show field' }));

    expect(mockChangeFieldVisibility).toHaveBeenCalledTimes(1);
    expect(mockChangeFieldVisibility).toHaveBeenLastCalledWith({
      fieldMetadataId: 'name',
      isVisible: true,
    });

    await user.keyboard('{Enter}');

    expect(mockChangeFieldVisibility).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
