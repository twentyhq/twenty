import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { AttachmentDropdown } from '@/activities/files/components/AttachmentDropdown';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';

const ATTACHMENT_PARENT_CLICK_OUTSIDE_ID = 'attachment-parent';

const BackgroundClickOutsideEffect = ({
  onOutside,
}: {
  onOutside: () => void;
}) => {
  useListenClickOutside({
    listenerId: 'background-board',
    excludedClickOutsideIds: [ATTACHMENT_PARENT_CLICK_OUTSIDE_ID],
    refs: [],
    callback: onOutside,
  });

  return null;
};

const renderAttachmentMenu = (hasDownloadPermission = true) => {
  const onDownload = jest.fn();
  const onDelete = jest.fn();
  const onRename = jest.fn();
  const onRowClick = jest.fn();
  const onOutside = jest.fn();
  const store = createStore();

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={store}>
        <BackgroundClickOutsideEffect onOutside={onOutside} />
        <ParentClickOutsideIdContext.Provider
          value={ATTACHMENT_PARENT_CLICK_OUTSIDE_ID}
        >
          <div
            onClick={onRowClick}
            data-click-outside-id={ATTACHMENT_PARENT_CLICK_OUTSIDE_ID}
          >
            <AttachmentDropdown
              attachmentId="attachment"
              onDownload={onDownload}
              onDelete={onDelete}
              onRename={onRename}
              hasDownloadPermission={hasDownloadPermission}
            />
          </div>
        </ParentClickOutsideIdContext.Provider>
      </Provider>
    </I18nProvider>,
  );

  return {
    user: userEvent.setup(),
    onDownload,
    onDelete,
    onRename,
    onRowClick,
    onOutside,
    store,
  };
};

describe('AttachmentDropdown', () => {
  it('downloads without opening the surrounding attachment and restores trigger focus', async () => {
    const { user, onDownload, onRowClick, onOutside, store } =
      renderAttachmentMenu();
    const trigger = screen.getByRole('button', { name: 'More options' });

    await user.click(trigger);
    expect(
      (await screen.findAllByRole('menuitem')).map((item) => item.textContent),
    ).toEqual(['Download', 'Rename', 'Delete']);
    await user.click(screen.getByRole('menuitem', { name: 'Download' }));

    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(onOutside).not.toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await waitFor(() => expect(store.get(focusStackState.atom)).toEqual([]));
    await user.click(document.body);
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it('omits unauthorized downloads and supports keyboard deletion', async () => {
    const { user, onDelete, onRename, onRowClick } =
      renderAttachmentMenu(false);
    const trigger = screen.getByRole('button', { name: 'More options' });
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    const rename = await screen.findByRole('menuitem', { name: 'Rename' });
    await waitFor(() => expect(rename).toHaveFocus());
    expect(
      screen.queryByRole('menuitem', { name: 'Download' }),
    ).not.toBeInTheDocument();
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onRename).not.toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });
});
