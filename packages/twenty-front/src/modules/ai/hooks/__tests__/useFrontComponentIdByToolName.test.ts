import { renderHook } from '@testing-library/react';

import { useFrontComponentIdByToolName } from '@/ai/hooks/useFrontComponentIdByToolName';

const APP_FRONT_COMPONENT_ID = '20202020-0000-4000-8000-000000000001';

jest.mock('@/ai/hooks/useGetToolIndex', () => ({
  useGetToolIndex: () => ({
    toolIndex: [
      { name: 'web_search' },
      { name: 'app_show_chart', frontComponentId: APP_FRONT_COMPONENT_ID },
      {
        name: 'find_many_companies',
        widgetName: 'records',
        frontComponentId: APP_FRONT_COMPONENT_ID,
      },
    ],
  }),
}));

describe('useFrontComponentIdByToolName', () => {
  it('maps tools to their app component, letting a built-in widget take precedence', () => {
    const { result } = renderHook(() => useFrontComponentIdByToolName());

    expect(Object.fromEntries(result.current)).toEqual({
      app_show_chart: APP_FRONT_COMPONENT_ID,
    });
  });
});
