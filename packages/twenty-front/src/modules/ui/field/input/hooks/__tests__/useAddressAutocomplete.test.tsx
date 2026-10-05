import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { type PlaceDetailsResult } from '@/geo-map/types/PlaceApi';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { act, renderHook } from '@testing-library/react';
import { useAddressAutocomplete } from '@/ui/field/input/hooks/useAddressAutocomplete';
import { useCountryUtils } from '@/ui/field/input/hooks/useCountryUtils';

jest.mock('@/geo-map/hooks/useGetPlaceApiData');
jest.mock('../useCountryUtils');
jest.mock('@/ui/layout/dropdown/hooks/useOpenDropdown');
jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown');
jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (...args: any[]) => any) =>
    Object.assign(fn, { cancel: () => undefined }),
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
      await result.current.getAutocompletePlaceData({ address: '123 Main' });
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
      await result.current.getAutocompletePlaceData({
        address: 'nonexistent',
      });
    });

    expect(mockCloseDropdown).toHaveBeenCalled();
  });

  it('should close dropdown when autocomplete data is null', async () => {
    mockGetPlaceAutocompleteData.mockResolvedValue(null);

    const { result } = renderHook(() => useAddressAutocomplete());

    await act(async () => {
      await result.current.getAutocompletePlaceData({ address: 'test' });
    });

    expect(mockCloseDropdown).toHaveBeenCalled();
  });

  it('should keep edits made while place details are loading', async () => {
    const mockOnChange = jest.fn();
    let internalValue = {
      addressStreet1: '10 Rue',
      addressStreet2: null as string | null,
      addressCity: null,
      addressState: null,
      addressCountry: null,
      addressPostcode: null,
      addressLat: null,
      addressLng: null,
    };

    mockGetPlaceDetailsData.mockImplementation(async () => {
      internalValue = { ...internalValue, addressStreet2: 'Suite 5' };

      return { street: '10 Rue de Rivoli', city: 'Paris' };
    });

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    await act(async () => {
      await result.current.autoFillInputsFromPlaceDetails({
        placeId: 'rivoli',
        token: 'token123',
        getInternalValue: () => internalValue,
      });
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        addressStreet1: '10 Rue de Rivoli',
        addressStreet2: 'Suite 5',
        addressCity: 'Paris',
      }),
    );
  });

  it('should keep a city edited while place details are loading', async () => {
    const mockOnChange = jest.fn();
    let internalValue = {
      addressStreet1: '10 Rue',
      addressStreet2: null,
      addressCity: null as string | null,
      addressState: null,
      addressCountry: null,
      addressPostcode: null,
      addressLat: null,
      addressLng: null,
    };

    mockGetPlaceDetailsData.mockImplementation(async () => {
      internalValue = { ...internalValue, addressCity: 'Lyon' };

      return { street: '10 Rue de Rivoli', city: 'Paris', postcode: '75001' };
    });

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    await act(async () => {
      await result.current.autoFillInputsFromPlaceDetails({
        placeId: 'rivoli',
        token: 'token123',
        getInternalValue: () => internalValue,
      });
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        addressStreet1: '10 Rue de Rivoli',
        addressCity: 'Lyon',
        addressPostcode: '75001',
      }),
    );
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
      await result.current.autoFillInputsFromPlaceDetails({
        placeId: 'place123',
        token: 'token123',
        addressStreet1: '123 Main St',
        getInternalValue: () => internalValue,
      });
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

  it('should use place street over full autocomplete text', async () => {
    const mockOnChange = jest.fn();

    mockGetPlaceDetailsData.mockResolvedValue({
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      country: 'US',
      postcode: '62704',
    });
    mockFindCountryNameByCountryCode.mockReturnValue('United States');

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    await act(async () => {
      await result.current.autoFillInputsFromPlaceDetails({
        placeId: 'place123',
        token: 'token123',
        addressStreet1: '123 Main St, Springfield, IL 62704, USA',
        getInternalValue: () => ({
          addressStreet1: '',
          addressStreet2: null,
          addressCity: null,
          addressState: null,
          addressCountry: null,
          addressPostcode: null,
          addressLat: null,
          addressLng: null,
        }),
      });
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        addressStreet1: '123 Main St',
      }),
    );
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
      await result.current.autoFillInputsFromPlaceDetails({
        placeId: 'place123',
        token: 'token123',
        addressStreet1: '123 Main St',
        getInternalValue: () => internalValue,
      });
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
      await result.current.autoFillInputsFromPlaceDetails({
        placeId: 'place123',
        token: 'token123',
      });
    });

    expect(mockCloseDropdown).toHaveBeenCalled();
  });

  it('should ignore place details of a superseded selection', async () => {
    const mockOnChange = jest.fn();
    const resolvePlaceDetailsRequests: Array<
      (placeDetails: PlaceDetailsResult) => void
    > = [];

    mockGetPlaceDetailsData.mockImplementation(
      () =>
        new Promise<PlaceDetailsResult>((resolve) => {
          resolvePlaceDetailsRequests.push(resolve);
        }),
    );

    const internalValue = {
      addressStreet1: 'Place',
      addressStreet2: null,
      addressCity: null,
      addressState: null,
      addressCountry: null,
      addressPostcode: null,
      addressLat: null,
      addressLng: null,
    };

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    let firstSelection: Promise<unknown> = Promise.resolve();
    let secondSelection: Promise<unknown> = Promise.resolve();

    act(() => {
      firstSelection = result.current.autoFillInputsFromPlaceDetails({
        placeId: 'bellecour',
        token: 'token123',
        getInternalValue: () => internalValue,
      });
      secondSelection = result.current.autoFillInputsFromPlaceDetails({
        placeId: 'concorde',
        token: 'token123',
        getInternalValue: () => internalValue,
      });
    });

    await act(async () => {
      resolvePlaceDetailsRequests[0]({
        street: 'Place Bellecour',
        city: 'Lyon',
      });
      await expect(firstSelection).resolves.toBeUndefined();
    });

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockCloseDropdown).not.toHaveBeenCalled();

    await act(async () => {
      resolvePlaceDetailsRequests[1]({
        street: 'Place de la Concorde',
        city: 'Paris',
      });
      await secondSelection;
    });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        addressStreet1: 'Place de la Concorde',
        addressCity: 'Paris',
      }),
    );
    expect(mockCloseDropdown).toHaveBeenCalled();
  });

  it('should close dropdown when place details fail to load', async () => {
    const mockOnChange = jest.fn();
    mockGetPlaceDetailsData.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    act(() => {
      result.current.setTypeOfAddressForAutocomplete('addressStreet1');
    });

    await act(async () => {
      await expect(
        result.current.autoFillInputsFromPlaceDetails({
          placeId: 'place123',
          token: 'token123',
        }),
      ).rejects.toThrow('Network error');
    });

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockCloseDropdown).toHaveBeenCalled();
    expect(result.current.typeOfAddressForAutocomplete).toBeNull();
  });

  it('should set token to null after autofilling', async () => {
    const mockOnChange = jest.fn();
    mockGetPlaceDetailsData.mockResolvedValue({});
    mockGetPlaceAutocompleteData.mockResolvedValue([
      { text: '123 Main St', placeId: 'place123' },
    ]);

    const { result } = renderHook(() => useAddressAutocomplete(mockOnChange));

    await act(async () => {
      await result.current.getAutocompletePlaceData({
        address: '123 Main St',
      });
    });

    expect(result.current.tokenForPlaceApi).not.toBeNull();

    await act(async () => {
      await result.current.autoFillInputsFromPlaceDetails({
        placeId: 'place123',
        token: 'token123',
      });
    });

    expect(result.current.tokenForPlaceApi).toBeNull();
  });

  it('reuses the session token before state has rerendered', async () => {
    mockGetPlaceAutocompleteData.mockResolvedValue([
      { text: '123 Main St', placeId: 'place123' },
    ]);

    const { result } = renderHook(() => useAddressAutocomplete());

    await act(async () => {
      await Promise.all([
        result.current.getAutocompletePlaceData({ address: '123 Main' }),
        result.current.getAutocompletePlaceData({ address: '123 Main St' }),
      ]);
    });

    const firstToken = mockGetPlaceAutocompleteData.mock.calls[0][1];
    const secondToken = mockGetPlaceAutocompleteData.mock.calls[1][1];

    expect(firstToken).toBe(secondToken);
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
      await result.current.autoFillInputsFromPlaceDetails({
        placeId: 'place123',
        token: 'token123',
      });
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
      await result.current.getAutocompletePlaceData({
        address: 'Boston',
        country: 'US',
        isFieldCity: true,
      });
    });

    expect(mockGetPlaceAutocompleteData).toHaveBeenCalledWith(
      'Boston',
      expect.any(String),
      'US',
      true,
    );
  });
});
