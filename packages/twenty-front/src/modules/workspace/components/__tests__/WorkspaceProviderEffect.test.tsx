import { render, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { WorkspaceProviderEffect } from '@/workspace/components/WorkspaceProviderEffect';

jest.mock('@/domain-manager/hooks/useGetPublicWorkspaceDataByDomain', () => ({
  useGetPublicWorkspaceDataByDomain: () => ({ data: undefined }),
}));

jest.mock('@/app/hooks/useInitializeQueryParamState', () => ({
  useInitializeQueryParamState: () => ({
    initializeQueryParamState: jest.fn(),
  }),
}));

const renderEffect = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <WorkspaceProviderEffect />
    </JotaiProvider>,
  );

describe('WorkspaceProviderEffect', () => {
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    resetJotaiStore();
    windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);
    window.history.pushState({}, '', '/objects/companies?view=all');
    jotaiStore.set(domainConfigurationState.atom, {
      frontDomain: 'localhost',
      defaultSubdomain: 'app',
      publicFunctionDomain: undefined,
      serverUrl: '',
    });
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
  });

  it('redirects the bare front domain to the default domain once, keeping path and query', async () => {
    jotaiStore.set(isMultiWorkspaceEnabledState.atom, true);

    const { rerender } = renderEffect();
    rerender(
      <JotaiProvider store={jotaiStore}>
        <WorkspaceProviderEffect />
      </JotaiProvider>,
    );

    await waitFor(() => expect(windowOpenSpy).toHaveBeenCalled());

    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'http://app.localhost/objects/companies?view=all',
      '_self',
    );
  });

  it('does not redirect the front domain in single-workspace mode', async () => {
    jotaiStore.set(isMultiWorkspaceEnabledState.atom, false);

    renderEffect();

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(windowOpenSpy).not.toHaveBeenCalled();
  });
});
