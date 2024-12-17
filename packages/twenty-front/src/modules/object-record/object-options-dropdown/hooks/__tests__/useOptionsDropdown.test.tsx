import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ViewType } from '@/views/types/ViewType';

jest.mock('@/ui/layout/dropdown/hooks/useDropdown', () => ({
  useDropdown: jest.fn(() => ({
    closeDropdown: jest.fn(),
  })),
}));

describe('useOptionsDropdown', () => {
  const mockOnContentChange = jest.fn();
  const mockCloseDropdown = jest.fn();
  const mockResetContent = jest.fn();

  beforeEach(() => {
    jest.mocked(useDropdown).mockReturnValue({
      scopeId: 'mock-scope',
      isDropdownOpen: false,
      closeDropdown: mockCloseDropdown,
      toggleDropdown: jest.fn(),
      openDropdown: jest.fn(),
      dropdownWidth: undefined,
      setDropdownWidth: jest.fn(),
      dropdownPlacement: null,
      setDropdownPlacement: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (contextValue: Partial<any> = {}) => {
    const wrapper = ({ children }: any) => (
      <ObjectOptionsDropdownContext.Provider
        value={{
          viewType: ViewType.Table,
          objectMetadataItem: {
            __typename: 'object',
            id: '1',
            nameSingular: 'company',
            namePlural: 'companies',
            labelSingular: 'Company',
            labelPlural: 'Companies',
            icon: 'IconBuildingSkyscraper',
            fields: [{}],
          } as ObjectMetadataItem,
          recordIndexId: 'test-record-index',
          currentContentId: 'recordGroups',
          onContentChange: mockOnContentChange,
          resetContent: mockResetContent,
          dropdownId: OBJECT_OPTIONS_DROPDOWN_ID,
          ...contextValue,
        }}
      >
        {children}
      </ObjectOptionsDropdownContext.Provider>
    );
    return renderHook(() => useOptionsDropdown(), { wrapper });
  };

  it('provides closeDropdown functionality from the context', () => {
    const { result } = renderWithProvider();

    act(() => {
      result.current.closeDropdown();
    });

    expect(mockResetContent).toHaveBeenCalled();
    expect(mockCloseDropdown).toHaveBeenCalled();
  });

  it('returns all context values', () => {
    const { result } = renderWithProvider({
      currentContentId: 'fields',
    });

    expect(result.current).toHaveProperty('currentContentId', 'fields');
    expect(result.current).toHaveProperty(
      'onContentChange',
      mockOnContentChange,
    );
    expect(result.current).toHaveProperty('closeDropdown');
    expect(result.current).toHaveProperty('resetContent', mockResetContent);
  });
});
