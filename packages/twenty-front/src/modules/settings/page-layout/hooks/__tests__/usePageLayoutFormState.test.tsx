import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { savedPageLayoutsState } from '../../states/savedPageLayoutsState';
import { usePageLayoutFormState } from '../usePageLayoutFormState';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));

const mockSavedLayouts = [
  {
    id: 'layout-1',
    name: 'Test Layout',
    type: 'DASHBOARD' as const,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    widgets: [
      {
        id: 'widget-1',
        title: 'Test Widget',
        type: 'GRAPH' as const,
        graphType: 'pie' as const,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 2,
          columnSpan: 2,
        },
      },
    ],
  },
];

describe('usePageLayoutFormState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values when creating new layout', () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'new' });

    const { result } = renderHook(() => usePageLayoutFormState(), {
      wrapper: ({ children }) => <RecoilRoot>{children}</RecoilRoot>,
    });

    expect(result.current.isEditMode).toBe(false);
    expect(result.current.existingLayout).toBeUndefined();
    expect(result.current.watchedValues.name).toBe('');
    expect(result.current.watchedValues.type).toBe('DASHBOARD');
    expect(result.current.watchedValues.widgets).toEqual([]);
    expect(result.current.canSave).toBe(false);
  });

  it('should load existing layout when editing', () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'layout-1' });

    const { result } = renderHook(() => usePageLayoutFormState(), {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={({ set }) => {
            set(savedPageLayoutsState, mockSavedLayouts);
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    expect(result.current.isEditMode).toBe(true);
    expect(result.current.existingLayout).toEqual(mockSavedLayouts[0]);
    expect(result.current.watchedValues.name).toBe('Test Layout');
    expect(result.current.watchedValues.type).toBe('DASHBOARD');
    expect(result.current.watchedValues.widgets).toHaveLength(1);
  });

  it('should determine canSave based on name validity', () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'new' });

    const { result, rerender } = renderHook(() => usePageLayoutFormState(), {
      wrapper: ({ children }) => <RecoilRoot>{children}</RecoilRoot>,
    });

    expect(result.current.canSave).toBe(false);

    result.current.formMethods.setValue('name', 'My Layout');
    rerender();

    expect(result.current.watchedValues.name).toBe('My Layout');
    expect(result.current.canSave).toBe(true);
  });

  it('should handle undefined id param correctly', () => {
    (useParams as jest.Mock).mockReturnValue({});

    const { result } = renderHook(() => usePageLayoutFormState(), {
      wrapper: ({ children }) => <RecoilRoot>{children}</RecoilRoot>,
    });

    expect(result.current.isEditMode).toBeFalsy();
    expect(result.current.existingLayout).toBeUndefined();
  });

  it('should provide form methods', () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'new' });

    const { result } = renderHook(() => usePageLayoutFormState(), {
      wrapper: ({ children }) => <RecoilRoot>{children}</RecoilRoot>,
    });

    expect(result.current.formMethods).toHaveProperty('setValue');
    expect(result.current.formMethods).toHaveProperty('handleSubmit');
    expect(result.current.formMethods).toHaveProperty('watch');
    expect(result.current.formMethods).toHaveProperty('formState');
  });
});
