import { PageChangeEffect } from '@/app/effect-components/PageChangeEffect';
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { enableFetchMocks } from 'jest-fetch-mock';
import {
  createMemoryRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

enableFetchMocks();

jest.mock('~/hooks/usePageChangeEffectNavigateLocation', () => ({
  usePageChangeEffectNavigateLocation: () => {
    const { pathname } = useLocation();

    return pathname === AppPath.SignInUp ? undefined : AppPath.SignInUp;
  },
}));

jest.mock('@/app/hooks/useExecuteTasksOnAnyLocationChange', () => ({
  useExecuteTasksOnAnyLocationChange: () => ({
    executeTasksOnAnyLocationChange: jest.fn(),
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: jest.fn(),
  }),
}));

jest.mock(
  '@/object-record/record-table/hooks/internal/useResetTableRowSelection',
  () => ({
    useResetTableRowSelection: () => ({
      resetTableRowSelection: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/object-record/record-table/hooks/useFocusedRecordTableRow',
  () => ({
    useFocusedRecordTableRow: () => ({
      unfocusRecordTableRow: jest.fn(),
    }),
  }),
);

jest.mock('@/object-record/record-table/hooks/useActiveRecordTableRow', () => ({
  useActiveRecordTableRow: () => ({
    deactivateRecordTableRow: jest.fn(),
  }),
}));

jest.mock(
  '@/object-record/record-board/hooks/useResetRecordBoardSelection',
  () => ({
    useResetRecordBoardSelection: () => ({
      resetRecordBoardSelection: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/object-record/record-board/hooks/useActiveRecordBoardCard',
  () => ({
    useActiveRecordBoardCard: () => ({
      deactivateBoardCard: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/object-record/record-board/hooks/useFocusedRecordBoardCard',
  () => ({
    useFocusedRecordBoardCard: () => ({
      unfocusBoardCard: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/object-record/record-index/hooks/useResetFocusStackToRecordIndex',
  () => ({
    useResetFocusStackToRecordIndex: () => ({
      resetFocusStackToRecordIndex: jest.fn(),
    }),
  }),
);

jest.mock('@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem', () => ({
  useResetFocusStackToFocusItem: () => ({
    resetFocusStackToFocusItem: jest.fn(),
  }),
}));

jest.mock(
  '@/object-record/record-title-cell/hooks/useOpenNewRecordTitleCell',
  () => ({
    useOpenNewRecordTitleCell: () => ({
      openNewRecordTitleCell: jest.fn(),
    }),
  }),
);

jest.mock('~/modules/app/utils/getPageLayoutIdForLocation', () => ({
  getPageLayoutIdForLocation: () => null,
}));

describe('PageChangeEffect', () => {
  it('redirects signed-out users to sign in when a route also renders Navigate', async () => {
    const router = createMemoryRouter(
      [
        {
          element: (
            <>
              <PageChangeEffect />
              <Outlet />
            </>
          ),
          children: [
            {
              path: '/settings/security',
              element: <Navigate to="/settings/general#security" replace />,
            },
            {
              path: '/settings/general',
              element: <h1>General settings</h1>,
            },
            {
              path: AppPath.SignInUp,
              element: <h1>Sign in</h1>,
            },
          ],
        },
      ],
      { initialEntries: ['/settings/security'] },
    );

    const { unmount } = render(
      <Provider store={createStore()}>
        <RouterProvider router={router} />
      </Provider>,
    );

    try {
      expect(
        await screen.findByRole('heading', { name: 'Sign in' }),
      ).toBeInTheDocument();
      expect(router.state.location.pathname).toBe(AppPath.SignInUp);
    } finally {
      unmount();
      router.dispose();
    }
  });
});
