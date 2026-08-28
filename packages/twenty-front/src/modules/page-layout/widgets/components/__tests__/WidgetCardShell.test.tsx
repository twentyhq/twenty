import { createDefaultStandaloneRichTextWidget } from '@/page-layout/utils/createDefaultStandaloneRichTextWidget';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createPortal } from 'react-dom';
import {
  PageLayoutTabLayoutMode,
  WidgetType,
} from '~/generated-metadata/graphql';

jest.mock('@/page-layout/contexts/PageLayoutContentContext', () => ({
  usePageLayoutContentContext: () => ({ layoutMode: 'VERTICAL_LIST' }),
}));

jest.mock('@/page-layout/hooks/useCurrentPageLayoutOrThrow', () => ({
  useCurrentPageLayoutOrThrow: () => ({
    currentPageLayout: { type: 'RECORD_PAGE' },
  }),
}));

jest.mock(
  '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay',
  () => ({
    PageLayoutWidgetForbiddenDisplay: () => null,
  }),
);

jest.mock(
  '@/page-layout/widgets/components/PageLayoutWidgetInvalidConfigDisplay',
  () => ({
    PageLayoutWidgetInvalidConfigDisplay: () => null,
  }),
);

jest.mock(
  '@/page-layout/widgets/widget-card/components/WidgetCardHeader',
  () => ({
    WidgetCardHeader: ({ title }: { title: string }) => <div>{title}</div>,
  }),
);

jest.mock('@/page-layout/widgets/components/WidgetContentRenderer', () => ({
  WidgetContentRenderer: () => (
    <>
      <textarea
        aria-label="Widget content"
        defaultValue="Shared instructions"
      />
      {createPortal(<button>Format text</button>, document.body)}
    </>
  ),
}));

const renderWidget = (type = WidgetType.STANDALONE_RICH_TEXT) => {
  const onClick = jest.fn();
  const widget = {
    ...createDefaultStandaloneRichTextWidget({
      id: 'note-widget',
      pageLayoutTabId: 'tab-1',
      title: 'Widget title',
      body: { blocknote: '', markdown: null },
      position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
    }),
    type,
  };

  render(
    <WidgetCardShell
      widget={widget}
      variant="flush"
      isEditable
      isEditing={false}
      isDragging={false}
      isResizing={false}
      showHeader
      hasAccess
      restriction={{ type: null }}
      onClick={onClick}
      onRemove={jest.fn()}
    />,
  );

  return { onClick };
};

describe('WidgetCardShell', () => {
  it.each([WidgetType.STANDALONE_RICH_TEXT, WidgetType.RECORD_TABLE])(
    'does not open settings when selecting interactive %s content',
    async (type) => {
      const { onClick } = renderWidget(type);

      await userEvent
        .setup()
        .tripleClick(screen.getByRole('textbox', { name: 'Widget content' }));

      expect(onClick).not.toHaveBeenCalled();
      expect(screen.getByRole('textbox')).toHaveFocus();
    },
  );

  it('does not open Note settings when using a portaled formatting menu', async () => {
    const { onClick } = renderWidget();

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Format text' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('still opens Note settings from the header', async () => {
    const { onClick } = renderWidget();

    await userEvent.setup().click(screen.getByText('Widget title'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('still opens settings when clicking non-interactive widget content', async () => {
    const { onClick } = renderWidget(WidgetType.FIELD);

    await userEvent
      .setup()
      .click(screen.getByRole('textbox', { name: 'Widget content' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
