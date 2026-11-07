import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { expect, within } from 'storybook/test';

import { AppRouteErrorFallback } from '@/error-handler/components/AppRouteErrorFallback';

const ThrowingRoute = (): never => {
  throw new Error('Target object metadata item not found');
};

const RouterWithThrowingRoute = () => {
  const [router] = useState(() =>
    createMemoryRouter([
      {
        path: '/',
        element: <ThrowingRoute />,
        errorElement: <AppRouteErrorFallback />,
      },
    ]),
  );

  return <RouterProvider router={router} />;
};

const meta: Meta<typeof RouterWithThrowingRoute> = {
  title: 'Modules/ErrorHandler/AppRouteErrorFallback',
  component: RouterWithThrowingRoute,
};

export default meta;

type Story = StoryObj<typeof RouterWithThrowingRoute>;

export const RouteRenderError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('Sorry, something went wrong'),
    ).toBeVisible();
    await expect(
      canvas.queryByText('Unexpected Application Error!'),
    ).not.toBeInTheDocument();
  },
};
