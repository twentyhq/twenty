import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { usePlaceAutocomplete } from '@/geo-map/hooks/usePlaceAutocomplete';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { act, renderHook } from '@testing-library/react';

jest.mock('@/geo-map/hooks/useGetPlaceApiData');
jest.mock('@/ui/layout/dropdown/hooks/useOpenDropdown');
jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown');
jest.mock('use-debounce', () => ({
  useDebouncedCallback: (callback: (...args: any[]) => any) => callback,
}));
jest.mock('uuid', () => ({ v4: () => 'session-token' }));

const mockGetPlaceAutocompleteData = jest.fn();
const mockOpenDropdown = jest.fn();
const mockCloseDropdown = jest.fn();

describe('usePlaceAutocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useGetPlaceApiData as jest.Mock).mockReturnValue({
      getPlaceAutocompleteData: mockGetPlaceAutocompleteData,
    });
    (useOpenDropdown as jest.Mock).mockReturnValue({
      openDropdown: mockOpenDropdown,
    });
    (useCloseDropdown as jest.Mock).mockReturnValue({
      closeDropdown: mockCloseDropdown,
    });
  });

  it('opens the requested dropdown with autocomplete results', async () => {
    mockGetPlaceAutocompleteData.mockResolvedValue([
      { text: 'Paris, France', placeId: 'paris' },
    ]);

    const { result } = renderHook(() =>
      usePlaceAutocomplete('location-dropdown'),
    );

    await act(async () => {
      await result.current.getAutocompletePlaceData('Paris');
    });

    expect(mockGetPlaceAutocompleteData).toHaveBeenCalledWith(
      'Paris',
      'session-token',
      undefined,
      undefined,
    );
    expect(mockOpenDropdown).toHaveBeenCalledWith({
      dropdownComponentInstanceIdFromProps: 'location-dropdown',
    });
    expect(result.current.placeAutocompleteData).toEqual([
      { text: 'Paris, France', placeId: 'paris' },
    ]);
    expect(result.current.tokenForPlaceApi).toBe('session-token');
  });

  it('does not query for an empty value', async () => {
    const { result } = renderHook(() =>
      usePlaceAutocomplete('location-dropdown'),
    );

    await act(async () => {
      await result.current.getAutocompletePlaceData('   ');
    });

    expect(mockGetPlaceAutocompleteData).not.toHaveBeenCalled();
    expect(mockCloseDropdown).toHaveBeenCalledWith('location-dropdown');
  });

  it('closes and clears the dropdown when no results are available', async () => {
    mockGetPlaceAutocompleteData
      .mockResolvedValueOnce([{ text: 'Paris, France', placeId: 'paris' }])
      .mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      usePlaceAutocomplete('location-dropdown'),
    );

    await act(async () => {
      await result.current.getAutocompletePlaceData('Paris');
    });
    await act(async () => {
      await result.current.getAutocompletePlaceData('No result');
    });

    expect(mockCloseDropdown).toHaveBeenCalledWith('location-dropdown');
    expect(result.current.placeAutocompleteData).toEqual([]);
  });

  it('resets the autocomplete session after a selection', async () => {
    mockGetPlaceAutocompleteData.mockResolvedValue([
      { text: 'Paris, France', placeId: 'paris' },
    ]);

    const { result } = renderHook(() =>
      usePlaceAutocomplete('location-dropdown'),
    );

    await act(async () => {
      await result.current.getAutocompletePlaceData('Paris');
    });
    act(() => {
      result.current.resetPlaceAutocomplete();
    });

    expect(result.current.tokenForPlaceApi).toBeNull();
    expect(result.current.placeAutocompleteData).toEqual([]);
    expect(mockCloseDropdown).toHaveBeenCalledWith('location-dropdown');
  });
});
