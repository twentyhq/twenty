import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { CommandMenuPersistentContextStoreEffect } from '@/command-menu/components/CommandMenuPersistentContextStoreEffect';
import { isCommandMenuPersistentState } from '@/command-menu/states/isCommandMenuPersistentState';

describe('CommandMenuPersistentContextStoreEffect', () => {
  it('should render without errors when persistent is enabled', () => {
    expect(() => {
      render(
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(isCommandMenuPersistentState, true);
          }}
        >
          <CommandMenuPersistentContextStoreEffect />
        </RecoilRoot>,
      );
    }).not.toThrow();
  });

  it('should render without errors when persistent is disabled', () => {
    expect(() => {
      render(
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(isCommandMenuPersistentState, false);
          }}
        >
          <CommandMenuPersistentContextStoreEffect />
        </RecoilRoot>,
      );
    }).not.toThrow();
  });

  it('should return null as it is an effect component', () => {
    const { container } = render(
      <RecoilRoot>
        <CommandMenuPersistentContextStoreEffect />
      </RecoilRoot>,
    );

    expect(container.firstChild).toBeNull();
  });
});
