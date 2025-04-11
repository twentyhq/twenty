import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { RecoilRoot, useRecoilState } from 'recoil';
import { createURLParamState } from '../createURLParamState';

const originalLocation = window.location;
const mockLocation = {
  ...originalLocation,
  pathname: '/test',
  search: '',
};

const originalHistory = window.history;
const mockHistory = {
  ...originalHistory,
  replaceState: jest.fn(),
};

describe('createURLParamState', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });
    Object.defineProperty(window, 'history', {
      value: mockHistory,
      writable: true,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original objects
    Object.defineProperty(window, 'location', {
      value: originalLocation,
    });
    Object.defineProperty(window, 'history', {
      value: originalHistory,
    });
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(RecoilRoot, null, children);

  it('should create a state with default value', () => {
    const testState = createURLParamState<string>({
      key: 'testState',
      paramName: 'test',
      defaultValue: 'default',
    });

    const { result } = renderHook(() => useRecoilState(testState), {
      wrapper: Wrapper,
    });

    expect(result.current[0]).toBe('default');
  });

  it('should parse URL parameter on initialization', () => {
    // Set URL parameter
    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        search: '?test=value',
      },
      writable: true,
    });

    const testState = createURLParamState<string>({
      key: 'testState2',
      paramName: 'test',
      defaultValue: 'default',
    });

    const { result } = renderHook(() => useRecoilState(testState), {
      wrapper: Wrapper,
    });

    expect(result.current[0]).toBe('value');
  });

  it('should update URL when state changes', () => {
    const testState = createURLParamState<string>({
      key: 'testState3',
      paramName: 'test',
      defaultValue: 'default',
    });

    const { result } = renderHook(() => useRecoilState(testState), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current[1]('newValue');
    });

    expect(mockHistory.replaceState).toHaveBeenCalledWith(
      {},
      '',
      '/test?test=%2522newValue%2522',
    );
  });

  it('should use custom parseValue function', () => {
    // Set URL parameter
    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        search: '?test=true',
      },
      writable: true,
    });

    const testState = createURLParamState<boolean>({
      key: 'testState4',
      paramName: 'test',
      defaultValue: false,
      parseValue: (value) => value === 'true',
    });

    const { result } = renderHook(() => useRecoilState(testState), {
      wrapper: Wrapper,
    });

    expect(result.current[0]).toBe(true);
  });

  it('should use custom stringifyValue function', () => {
    const testState = createURLParamState<boolean>({
      key: 'testState5',
      paramName: 'test',
      defaultValue: false,
      stringifyValue: (value) => (value ? 'true' : 'false'),
    });

    const { result } = renderHook(() => useRecoilState(testState), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current[1](true);
    });

    expect(mockHistory.replaceState).toHaveBeenCalledWith(
      {},
      '',
      '/test?test=true',
    );
  });

  it('should handle invalid URL parameters', () => {
    // Set invalid URL parameter
    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        search: '?test=invalid',
      },
      writable: true,
    });

    const testState = createURLParamState<number>({
      key: 'testState6',
      paramName: 'test',
      defaultValue: 0,
      parseValue: (value) => {
        const num = Number(value);
        return isNaN(num) ? null : num;
      },
    });

    const { result } = renderHook(() => useRecoilState(testState), {
      wrapper: Wrapper,
    });

    expect(result.current[0]).toBe(0);
  });

  it('should remove URL parameter when state equals default value', () => {
    const testState = createURLParamState<string>({
      key: 'testState7',
      paramName: 'test',
      defaultValue: 'default',
    });

    // Set URL parameter to non-default value
    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        search: '?test=custom',
      },
      writable: true,
    });

    const { result } = renderHook(() => useRecoilState(testState), {
      wrapper: Wrapper,
    });

    // Change state back to default value
    act(() => {
      result.current[1]('default');
    });

    expect(mockHistory.replaceState).toHaveBeenCalledWith({}, '', '/test');
  });
});
