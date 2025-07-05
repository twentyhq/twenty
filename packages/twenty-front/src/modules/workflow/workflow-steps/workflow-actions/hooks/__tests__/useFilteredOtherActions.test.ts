import { renderHook } from '@testing-library/react';
import { useFilteredOtherActions } from '../useFilteredOtherActions';

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(),
}));

jest.mock('../../constants/OtherActions', () => ({
  OTHER_ACTIONS: [
    { type: 'CODE', icon: 'IconCode', label: 'Code' },
    { type: 'HTTP_REQUEST', icon: 'IconHttp', label: 'HTTP Request' },
    { type: 'SEND_EMAIL', icon: 'IconMail', label: 'Send Email' },
    { type: 'AI_AGENT', icon: 'IconBrain', label: 'AI Agent' },
    { type: 'FORM', icon: 'IconForm', label: 'Form' },
  ],
}));

describe('useFilteredOtherActions', () => {
  const mockUseIsFeatureEnabled = jest.mocked(
    jest.requireMock('@/workspace/hooks/useIsFeatureEnabled')
      .useIsFeatureEnabled,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all actions when AI is enabled', () => {
    mockUseIsFeatureEnabled.mockReturnValue(true);

    const { result } = renderHook(() => useFilteredOtherActions());

    expect(result.current).toHaveLength(5);
    expect(result.current).toEqual([
      { type: 'CODE', icon: 'IconCode', label: 'Code' },
      { type: 'HTTP_REQUEST', icon: 'IconHttp', label: 'HTTP Request' },
      { type: 'SEND_EMAIL', icon: 'IconMail', label: 'Send Email' },
      { type: 'AI_AGENT', icon: 'IconBrain', label: 'AI Agent' },
      { type: 'FORM', icon: 'IconForm', label: 'Form' },
    ]);
  });

  it('should filter out AI_AGENT when AI is disabled', () => {
    mockUseIsFeatureEnabled.mockReturnValue(false);

    const { result } = renderHook(() => useFilteredOtherActions());

    expect(result.current).toHaveLength(4);
    expect(result.current).toEqual([
      { type: 'CODE', icon: 'IconCode', label: 'Code' },
      { type: 'HTTP_REQUEST', icon: 'IconHttp', label: 'HTTP Request' },
      { type: 'SEND_EMAIL', icon: 'IconMail', label: 'Send Email' },
      { type: 'FORM', icon: 'IconForm', label: 'Form' },
    ]);
    expect(
      result.current.find((action) => action.type === 'AI_AGENT'),
    ).toBeUndefined();
  });

  it('should call useIsFeatureEnabled with correct feature flag', () => {
    mockUseIsFeatureEnabled.mockReturnValue(true);

    renderHook(() => useFilteredOtherActions());

    expect(mockUseIsFeatureEnabled).toHaveBeenCalledWith('IS_AI_ENABLED');
    expect(mockUseIsFeatureEnabled).toHaveBeenCalledTimes(1);
  });

  it('should handle feature flag hook returning undefined', () => {
    mockUseIsFeatureEnabled.mockReturnValue(undefined);

    const { result } = renderHook(() => useFilteredOtherActions());

    expect(result.current).toHaveLength(4);
    expect(
      result.current.find((action) => action.type === 'AI_AGENT'),
    ).toBeUndefined();
  });

  it('should handle feature flag hook returning null', () => {
    mockUseIsFeatureEnabled.mockReturnValue(null);

    const { result } = renderHook(() => useFilteredOtherActions());

    expect(result.current).toHaveLength(4);
    expect(
      result.current.find((action) => action.type === 'AI_AGENT'),
    ).toBeUndefined();
  });

  it('should handle feature flag hook returning false string', () => {
    mockUseIsFeatureEnabled.mockReturnValue('false');

    const { result } = renderHook(() => useFilteredOtherActions());

    expect(result.current).toHaveLength(5);
    expect(
      result.current.find((action) => action.type === 'AI_AGENT'),
    ).toBeDefined();
  });

  it('should handle feature flag hook throwing error', () => {
    mockUseIsFeatureEnabled.mockImplementation(() => {
      throw new Error('Feature flag error');
    });

    expect(() => {
      renderHook(() => useFilteredOtherActions());
    }).toThrow('Feature flag error');
  });
});
