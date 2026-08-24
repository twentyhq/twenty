import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore } from 'jotai';
import { expect, waitFor, within } from 'storybook/test';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';

type WidgetCardShellStoryProps = {
  isEditable: boolean;
  pageLayoutType: PageLayoutType;
  variant: WidgetCardVariant;
  widgetType: WidgetType;
};

const WidgetCardShellStory = ({
  isEditable,
  pageLayoutType,
  variant,
  widgetType,
}: WidgetCardShellStoryProps) => {
  const store = createStore();
  const widget = {
    ...makeWidget('widget-card-shell-story', 0),
    type: widgetType,
  };
  const pageLayout: PageLayout = {
    ...makeDraft([makeTab('tab-1', [widget])]),
    applicationId: '',
    createdAt: '2026-08-22T00:00:00.000Z',
    deletedAt: null,
    isSystemSideEffect: false,
    type: pageLayoutType,
    universalIdentifier: 'widget-card-shell-layout',
    updatedAt: '2026-08-22T00:00:00.000Z',
  };

  store.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayout,
  );
  store.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayout,
  );

  return (
    <div style={{ height: 200, width: 300 }}>
      <PageLayoutTestWrapper layoutType={pageLayoutType} store={store}>
        <PageLayoutContentProvider
          value={{
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            presentation: 'stack',
            tabId: 'tab-1',
          }}
        >
          <WidgetCardShell
            widget={widget}
            variant={variant}
            isEditable={isEditable}
            isEditing={false}
            isDragging={false}
            isResizing={false}
            showHeader={false}
            hasAccess={false}
            restriction={{ type: null }}
            onRemove={() => undefined}
          />
        </PageLayoutContentProvider>
      </PageLayoutTestWrapper>
    </div>
  );
};

const meta: Meta<typeof WidgetCardShellStory> = {
  title: 'Modules/PageLayout/Widgets/WidgetCardShell',
  component: WidgetCardShellStory,
  args: {
    isEditable: false,
    pageLayoutType: PageLayoutType.RECORD_PAGE,
    variant: 'flush',
    widgetType: WidgetType.IFRAME,
  },
};

export default meta;
type Story = StoryObj<typeof WidgetCardShellStory>;

const getWidgetContent = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const card = canvas.getByTestId('widget-card-shell-story');
  const content = card.firstElementChild;

  if (!(content instanceof HTMLElement)) {
    throw new Error('Widget content not found');
  }

  return content;
};

export const RecordPageIframe: Story = {
  play: async ({ canvasElement }) => {
    const content = getWidgetContent(canvasElement);
    const rootFontSizeInPixels = Number.parseFloat(
      getComputedStyle(content.ownerDocument.documentElement).fontSize,
    );

    await waitFor(() =>
      expect(getComputedStyle(content).minHeight).toBe(
        `${40 * rootFontSizeInPixels}px`,
      ),
    );
  },
};

export const StandalonePageIframe: Story = {
  args: {
    pageLayoutType: PageLayoutType.STANDALONE_PAGE,
  },
  play: async ({ canvasElement }) => {
    const content = getWidgetContent(canvasElement);

    await waitFor(() =>
      expect(getComputedStyle(content).minHeight).toBe('0px'),
    );
  },
};

export const FlushWorkflow: Story = {
  args: {
    widgetType: WidgetType.WORKFLOW,
  },
  play: async ({ canvasElement }) => {
    const content = getWidgetContent(canvasElement);

    await waitFor(() =>
      expect(getComputedStyle(content).paddingTop).toBe('0px'),
    );
  },
};

export const FlushTasks: Story = {
  args: {
    widgetType: WidgetType.TASKS,
  },
  play: async ({ canvasElement }) => {
    const content = getWidgetContent(canvasElement);

    await waitFor(() =>
      expect(getComputedStyle(content).paddingTop).not.toBe('0px'),
    );
  },
};
