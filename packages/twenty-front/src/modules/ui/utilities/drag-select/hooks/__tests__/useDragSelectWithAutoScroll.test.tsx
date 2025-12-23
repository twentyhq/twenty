import { renderHook } from '@testing-library/react';

import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useDragSelectWithAutoScroll } from '@/ui/utilities/drag-select/hooks/useDragSelectWithAutoScroll';

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext',
  () => ({
    useComponentInstanceStateContext: jest.fn(),
  }),
);

describe('useDragSelectWithAutoScroll', () => {
  const mockUseComponentInstanceStateContext = jest.mocked(
    useComponentInstanceStateContext,
  );

  const createMockScrollElement = (bounds = {}) => {
    const defaultBounds = {
      top: 100,
      left: 100,
      bottom: 400,
      right: 600,
      width: 500,
      height: 300,
    };

    const element = {
      getBoundingClientRect: jest
        .fn()
        .mockReturnValue({ ...defaultBounds, ...bounds }),
      scrollTo: jest.fn(),
      scrollTop: 50,
      scrollLeft: 25,
    };

    return element;
  };

  const originalGetElementById = document.getElementById;

  afterEach(() => {
    document.getElementById = originalGetElementById;
    jest.clearAllMocks();
  });

  describe('instance ID resolution', () => {
    it('should prioritize explicit scrollWrapperComponentInstanceId over context', () => {
      mockUseComponentInstanceStateContext.mockReturnValue({
        instanceId: 'context-instance',
      });

      const mockElement = createMockScrollElement();
      document.getElementById = jest
        .fn()
        .mockImplementation((id) =>
          id === 'scroll-wrapper-explicit-instance' ? mockElement : null,
        );

      const { result } = renderHook(() =>
        useDragSelectWithAutoScroll({
          scrollWrapperComponentInstanceId: 'explicit-instance',
        }),
      );

      result.current.handleAutoScroll(105, 250);

      expect(document.getElementById).toHaveBeenCalledWith(
        'scroll-wrapper-explicit-instance',
      );
      expect(mockElement.scrollTo).toHaveBeenCalled();
    });

    it('should use context instance ID when no explicit ID provided', () => {
      mockUseComponentInstanceStateContext.mockReturnValue({
        instanceId: 'context-instance',
      });

      const mockElement = createMockScrollElement();
      document.getElementById = jest
        .fn()
        .mockImplementation((id) =>
          id === 'scroll-wrapper-context-instance' ? mockElement : null,
        );

      const { result } = renderHook(() => useDragSelectWithAutoScroll({}));

      result.current.handleAutoScroll(105, 250);

      expect(document.getElementById).toHaveBeenCalledWith(
        'scroll-wrapper-context-instance',
      );
      expect(mockElement.scrollTo).toHaveBeenCalled();
    });

    it('should not attempt scrolling when no instance ID available', () => {
      mockUseComponentInstanceStateContext.mockReturnValue(null);
      document.getElementById = jest.fn();

      const { result } = renderHook(() => useDragSelectWithAutoScroll({}));

      result.current.handleAutoScroll(105, 105);

      expect(document.getElementById).not.toHaveBeenCalled();
    });
  });

  describe('edge detection and scroll calculations', () => {
    let mockElement: ReturnType<typeof createMockScrollElement>;

    beforeEach(() => {
      mockUseComponentInstanceStateContext.mockReturnValue({
        instanceId: 'test-instance',
      });

      mockElement = createMockScrollElement({
        top: 100,
        left: 100,
        bottom: 400,
        right: 600,
      });

      document.getElementById = jest.fn().mockReturnValue(mockElement);
    });

    it('should calculate correct scroll amounts for vertical scrolling', () => {
      const { result } = renderHook(() => useDragSelectWithAutoScroll({}));

      result.current.handleAutoScroll(300, 105);

      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        top: 35,
      });

      jest.clearAllMocks();

      result.current.handleAutoScroll(300, 395);

      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        top: 65,
      });
    });

    it('should calculate correct scroll amounts for horizontal scrolling', () => {
      const { result } = renderHook(() => useDragSelectWithAutoScroll({}));

      result.current.handleAutoScroll(105, 250);

      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        left: 10,
        behavior: 'auto',
      });

      jest.clearAllMocks();

      result.current.handleAutoScroll(595, 250);

      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        left: 40,
        behavior: 'auto',
      });
    });

    it('should prevent negative scroll values', () => {
      mockElement.scrollTop = 5;
      mockElement.scrollLeft = 3;

      const { result } = renderHook(() => useDragSelectWithAutoScroll({}));

      result.current.handleAutoScroll(105, 105);

      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        top: 0,
      });

      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        left: 0,
        behavior: 'auto',
      });
    });

    it('should not scroll when mouse is in safe zone', () => {
      const { result } = renderHook(() => useDragSelectWithAutoScroll({}));

      result.current.handleAutoScroll(350, 250);

      expect(mockElement.scrollTo).not.toHaveBeenCalled();

      result.current.handleAutoScroll(125, 250);
      result.current.handleAutoScroll(575, 250);
      result.current.handleAutoScroll(300, 125);
      result.current.handleAutoScroll(300, 375);

      expect(mockElement.scrollTo).not.toHaveBeenCalled();
    });

    it('should handle exact edge threshold boundaries', () => {
      const { result } = renderHook(() => useDragSelectWithAutoScroll({}));

      result.current.handleAutoScroll(119, 250);

      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        left: 10,
        behavior: 'auto',
      });

      jest.clearAllMocks();

      result.current.handleAutoScroll(120, 250);

      expect(mockElement.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockUseComponentInstanceStateContext.mockReturnValue({
        instanceId: 'test-instance',
      });
    });

    it('should handle missing DOM element gracefully', () => {
      document.getElementById = jest.fn().mockReturnValue(null);

      const { result } = renderHook(() => useDragSelectWithAutoScroll({}));

      expect(() => {
        result.current.handleAutoScroll(105, 105);
      }).not.toThrow();
    });

    it('should handle element without getBoundingClientRect', () => {
      const brokenElement = { scrollTo: jest.fn() };
      document.getElementById = jest.fn().mockReturnValue(brokenElement);

      const { result } = renderHook(() => useDragSelectWithAutoScroll({}));

      expect(() => {
        result.current.handleAutoScroll(105, 105);
      }).toThrow();
    });
  });
});
