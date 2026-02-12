import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { act, renderHook } from '@testing-library/react';
import { useAddressAutocomplete } from '@/ui/field/input/hooks/useAddressAutocomplete';
import { useCountryUtils } from '@/ui/field/input/hooks/useCountryUtils';

// Mock dependencies
jest.mock('@/geo-map/hooks/useGetPlaceApiData');
jest.mock('../useCountryUtils');
jest.mock('@/ui/layout/dropdown/hooks/useOpenDropdown');
jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown');
jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (...args: any[]) => any) => fn,
}));

const mockGetPlaceAutocompleteData = jest.fn();
const mockGetPlaceDetailsData = jest.fn();
const mockFindCountryNameByCountryCode = jest.fn();
const mockOpenDropdown = jest.fn();
const mockCloseDropdown = jest.fn();

describe('useAddressAutocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useGetPlaceApiData as jest.Mock).mockReturnValue({
      getPlaceAutocompleteData: mockGetPlaceAutocompleteData,
      getPlaceDetailsData: mockGetPlaceDetailsData,
    });

    (useCountryUtils as jest.Mock).mockReturnValue({
      findCountryNameByCountryCode: mockFindCountryNameByCountryCode,
    });

    (useOpenDropdown as jest.Mock).mockReturnValue({
      openDropdown: mockOpenDropdown,
    });

    (useCloseDropdown as jest.Mock).mockReturnValue({
      closeDropdown: mockCloseDropdown,
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAddressAutocomplete());

    expect(result.current.placeAutocompleteData).toEqual([]);
    expect(result.current.tokenForPlaceApi).toBeNull();
    expect(result.current.typeOfAddressForAutocomplete).toBeNull();
  });

  it('should open dropdown when autocomplete data is available', async () => {
    mockGetPlaceAutocompleteData.mockResolvedValue([
      { text: '123 Main St', placeId: 'place1' },
      { text: '456 Oak Ave', placeId: 'place2' },
    ]);

    const { result } = renderHook(() => useAddressAutocomplete());

    await act(async () => {
      await result.current.getAutocompletePlaceData('123 Main', 'token123');
    });

    expect(mockOpenDropdown).toHaveBeenCalled();
    expect(result.current.placeAutocompleteData).toEqual([
      { text: '123 Main St', placeId: 'place1' },
      { text: '456 Oak Ave', placeId: 'place2' },
    ]);
  });

  it('should close dropdown when no autocomplete data is available', async () => {
    mockGetPlaceAutocompleteData.mockResolvedValue([]);

    const { result } = renderHook(() => useAddressAutocomplete());

    await act(async () => {
      await result.current.getAutocompletePlaceData('nonexistent', 'token123');
    });

    expect(mockCloseDropdown).toHaveBeenCalled();
  });

  it('should close dropdown when autocomplete data is null', async () => {
    mockGetPlaceAutocompleteData.mockResolvedValue(null);

    const { result } = renderHook(() => useAddressAutocomplete());

    await act(async () => {
      await result.current.getAutocompletePlaceData('test', 'token123');
    });

    expect(mockCloseDropdown).toHaveBeenCalled();
  });

  it('should autofill inputs from place details', async () => {
    const mockOnChange = jest.fn();
    const mockPlaceData = {
      city: 'New York',
      state: 'NY',
      country: 'US',
      postcode: '10001',
      location: { lat: 40.7128, lng: -74.006 },
    };

    mockGetPlaceDetailsData.mockResolvedValue(mockPlaceData);
    mockFindCountryNameByCountryCode.mockReturnValue('United States');

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    const internalValue = {
      addressStreet1: '123 Main St',
      addressStreet2: null,
      addressCity: null,
      addressState: null,
      addressCountry: null,
      addressPostcode: null,
      addressLat: null,
      addressLng: null,
    };

    await act(async () => {
      await result.current.autoFillInputsFromPlaceDetails(
        'place123',
        'token123',
        '123 Main St',
        internalValue,
      );
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      addressStreet1: '123 Main St',
      addressStreet2: null,
      addressCity: 'New York',
      addressState: 'NY',
      addressCountry: 'United States',
      addressPostcode: '10001',
      addressLat: 40.7128,
      addressLng: -74.006,
    });
  });

  it('should preserve existing values when place data is missing', async () => {
    const mockOnChange = jest.fn();
    const mockPlaceData = {
      city: null,
      state: null,
      country: null,
      postcode: null,
      location: null,
    };

    mockGetPlaceDetailsData.mockResolvedValue(mockPlaceData);
    mockFindCountryNameByCountryCode.mockReturnValue(null);

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    const internalValue = {
      addressStreet1: '123 Main St',
      addressStreet2: 'Apt 4B',
      addressCity: 'Existing City',
      addressState: 'CA',
      addressCountry: 'United States',
      addressPostcode: '90210',
      addressLat: 34.0522,
      addressLng: -118.2437,
    };

    await act(async () => {
      await result.current.autoFillInputsFromPlaceDetails(
        'place123',
        'token123',
        '123 Main St',
        internalValue,
      );
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      addressStreet1: '123 Main St',
      addressStreet2: 'Apt 4B',
      addressCity: 'Existing City',
      addressState: 'CA',
      addressCountry: 'United States',
      addressPostcode: '90210',
      addressLat: 34.0522,
      addressLng: -118.2437,
    });
  });

  it('should close dropdown after autofilling', async () => {
    const mockOnChange = jest.fn();
    mockGetPlaceDetailsData.mockResolvedValue({});
    mockFindCountryNameByCountryCode.mockReturnValue(null);

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    await act(async () => {
      await result.current.autoFillInputsFromPlaceDetails(
        'place123',
        'token123',
      );
    });

    expect(mockCloseDropdown).toHaveBeenCalled();
  });

  it('should set token to null after autofilling', async () => {
    const mockOnChange = jest.fn();
    mockGetPlaceDetailsData.mockResolvedValue({});

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    // Set initial token
    act(() => {
      result.current.setTokenForPlaceApi('initial-token');
    });

    expect(result.current.tokenForPlaceApi).toBe('initial-token');

    await act(async () => {
      await result.current.autoFillInputsFromPlaceDetails(
        'place123',
        'token123',
      );
    });

    expect(result.current.tokenForPlaceApi).toBeNull();
  });

  it('should handle country code conversion correctly', async () => {
    const mockOnChange = jest.fn();
    const mockPlaceData = {
      country: 'US',
      city: 'Boston',
    };

    mockGetPlaceDetailsData.mockResolvedValue(mockPlaceData);
    mockFindCountryNameByCountryCode.mockReturnValue('United States');

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    await act(async () => {
      await result.current.autoFillInputsFromPlaceDetails(
        'place123',
        'token123',
      );
    });

    expect(mockFindCountryNameByCountryCode).toHaveBeenCalledWith('US');
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        addressCountry: 'United States',
      }),
    );
  });

  it('should handle address autocomplete with country and isFieldCity parameters', async () => {
    mockGetPlaceAutocompleteData.mockResolvedValue([
      { text: 'Boston, MA', placeId: 'place1' },
    ]);

    const { result } = renderHook(() => useAddressAutocomplete());

    await act(async () => {
      await result.current.getAutocompletePlaceData(
        'Boston',
        'token123',
        'US',
        true,
      );
    });

    expect(mockGetPlaceAutocompleteData).toHaveBeenCalledWith(
      'Boston',
      'token123',
      'US',
      true,
    );
  });
});
