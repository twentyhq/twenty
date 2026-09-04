import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { useOpenWidgetSettingsInSidePanel } from '@/side-panel/hooks/useOpenWidgetSettingsInSidePanel';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { widgetCreationTargetTabIdComponentState } from '@/page-layout/states/widgetCreationTargetTabIdComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { createDefaultStandaloneRichTextWidget } from '@/page-layout/utils/createDefaultStandaloneRichTextWidget';
import { RecordPageAddWidgetSection } from '@/page-layout/widgets/components/RecordPageAddWidgetSection';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { SidePanelPageLayoutRecordPageWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutRecordPageWidgetTypeSelect';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const NOTE_WIDGET = createDefaultStandaloneRichTextWidget({
  id: 'note-widget-story',
  pageLayoutTabId: 'tab-1',
  title: 'Note',
  body: {
    blocknote: JSON.stringify([
      { id: 'instructions', type: 'paragraph', content: 'Shared instructions' },
    ]),
    markdown: null,
  },
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
});
const DRAFT_ATOM = pageLayoutDraftComponentState.atomFamily({
  instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
});
const EDITING_WIDGET_ATOM = pageLayoutEditingWidgetIdComponentState.atomFamily({
  instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
});

type RecordPageNoteWidgetStoryProps = {
  isEditable: boolean;
  layoutType: PageLayoutType;
  surface: 'widget' | 'inline-picker' | 'side-panel';
  replacementPosition?: number;
};

const RecordPageNoteWidgetStory = ({
  isEditable,
  surface,
}: RecordPageNoteWidgetStoryProps) => {
  const { openWidgetSettingsInSidePanel } = useOpenWidgetSettingsInSidePanel();

  if (surface === 'inline-picker') {
    return <RecordPageAddWidgetSection />;
  }

  if (surface === 'side-panel') {
    return <SidePanelPageLayoutRecordPageWidgetTypeSelect />;
  }

  return (
    <WidgetCardShell
      widget={NOTE_WIDGET}
      variant="flush"
      isEditable={isEditable}
      isEditing={false}
      isDragging={false}
      isResizing={false}
      showHeader
      hasAccess
      restriction={{ type: null }}
      onClick={() =>
        openWidgetSettingsInSidePanel({
          widgetId: NOTE_WIDGET.id,
          widgetType: NOTE_WIDGET.type,
        })
      }
      onRemove={() => undefined}
    />
  );
};

const meta: Meta<typeof RecordPageNoteWidgetStory> = {
  title: 'Modules/PageLayout/Widgets/RecordPageNoteWidget',
  component: RecordPageNoteWidgetStory,
  args: {
    isEditable: true,
    layoutType: PageLayoutType.RECORD_PAGE,
    surface: 'widget',
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyFrontComponents', () =>
          HttpResponse.json({ data: { frontComponents: [] } }),
        ),
      ],
    },
  },
  beforeEach: ({ args }) => {
    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock(),
    );
    const company = getMockObjectMetadataItemOrThrow('company');
    const widgets = isDefined(args.replacementPosition)
      ? [
          makeWidget('first', 0),
          makeWidget('second', 1),
          { ...makeWidget('tasks', 2), type: WidgetType.TASKS },
        ]
      : args.surface === 'widget'
        ? [NOTE_WIDGET]
        : [];
    const layout = {
      ...makeDraft([makeTab('tab-1', widgets)]),
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      type: args.layoutType,
      objectMetadataId: company.id,
      applicationId: '',
      universalIdentifier: PAGE_LAYOUT_TEST_INSTANCE_ID,
      isSystemSideEffect: false,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
      deletedAt: null,
    };
    jotaiStore.set(DRAFT_ATOM, layout);
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      layout,
    );
    jotaiStore.set(metadataStoreState.atomFamily('pageLayouts'), {
      current: [layout],
      draft: [],
      status: 'up-to-date',
    });
    jotaiStore.set(
      isLayoutCustomizationModeEnabledState.atom,
      args.isEditable && args.layoutType === PageLayoutType.RECORD_PAGE,
    );
    jotaiStore.set(
      isDashboardInEditModeComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      args.isEditable && args.layoutType === PageLayoutType.DASHBOARD,
    );
    jotaiStore.set(
      EDITING_WIDGET_ATOM,
      isDefined(args.replacementPosition)
        ? widgets[args.replacementPosition].id
        : args.surface === 'widget'
          ? 'other-widget'
          : null,
    );
    jotaiStore.set(
      widgetCreationTargetTabIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      'tab-1',
    );
    jotaiStore.set(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      company.id,
    );
    jotaiStore.set(
      contextStoreTargetedRecordsRuleComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      { mode: 'selection', selectedRecordIds: ['company-record'] },
    );
  },
  decorators: [
    SnackBarDecorator,
    (Story, { args }) => (
      <MemoryRouter>
        <PageLayoutTestWrapper store={jotaiStore} layoutType={args.layoutType}>
          <LayoutRenderingProvider
            value={{
              layoutType: args.layoutType,
              targetRecordIdentifier: {
                id: 'company-record',
                targetObjectNameSingular: 'company',
              },
            }}
          >
            <ContextStoreComponentInstanceContext.Provider
              value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
            >
              <PageLayoutContentProvider
                value={{
                  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                  presentation: 'stack',
                  tabId: 'tab-1',
                }}
              >
                <div style={{ width: 360, height: 180, marginTop: 48 }}>
                  <Story />
                </div>
              </PageLayoutContentProvider>
            </ContextStoreComponentInstanceContext.Provider>
          </LayoutRenderingProvider>
        </PageLayoutTestWrapper>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RecordPageNoteWidgetStory>;

export const ReadOnly: Story = {
  args: { isEditable: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Shared instructions')).toBeVisible();
    await expect(canvas.getByRole('textbox')).toHaveAttribute(
      'contenteditable',
      'false',
    );
    await expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(false);
  },
};

export const SelectAndFormatText: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const editor = await canvas.findByRole('textbox');
    await userEvent.tripleClick(canvas.getByText('Shared instructions'));
    const bold = await body.findByRole('button', { name: /^Bold/ });
    await waitFor(() => expect(bold).toBeVisible());
    await expect(canvasElement.contains(bold)).toBe(false);
    await expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(false);
    await expect(jotaiStore.get(EDITING_WIDGET_ATOM)).toBe('other-widget');
    await userEvent.click(bold);
    await waitFor(() =>
      expect(canvas.getByText('instructions').closest('strong')).not.toBeNull(),
    );
    await expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(false);
    await expect(await canvas.findByRole('textbox')).toBe(editor);
    await waitFor(() =>
      expect(
        jotaiStore.get(DRAFT_ATOM).tabs[0].widgets[0].configuration,
      ).toMatchObject({
        body: { blocknote: expect.stringContaining('"bold":true') },
      }),
    );
    if (args.layoutType === PageLayoutType.RECORD_PAGE) {
      await userEvent.click(canvas.getByText('Note', { exact: true }));
      await expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(true);
      await expect(jotaiStore.get(EDITING_WIDGET_ATOM)).toBe(NOTE_WIDGET.id);
    }
  },
};

export const DashboardSelection: Story = {
  args: { layoutType: PageLayoutType.DASHBOARD },
  play: SelectAndFormatText.play,
};

export const CancelPendingEdit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const initialBody =
      jotaiStore.get(DRAFT_ATOM).tabs[0].widgets[0].configuration;
    const editor = await canvas.findByRole('textbox');
    await userEvent.type(editor, 'New');
    await expect(editor).toHaveTextContent('New');
    jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, false);
    jotaiStore.set(
      isDashboardInEditModeComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      false,
    );
    await canvas.findByText('Shared instructions');
    await expect(canvas.getByRole('textbox')).toHaveAttribute(
      'contenteditable',
      'false',
    );
    // A cancelled edit must stay discarded after the 300ms draft debounce.
    await new Promise((resolve) => setTimeout(resolve, 350));
    await expect(
      jotaiStore.get(DRAFT_ATOM).tabs[0].widgets[0].configuration,
    ).toEqual(initialBody);
  },
};

export const CancelPendingDashboardEdit: Story = {
  args: { layoutType: PageLayoutType.DASHBOARD },
  play: CancelPendingEdit.play,
};

export const AddFromInlinePicker: Story = {
  args: { surface: 'inline-picker' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/Static text shared across all record pages/),
    ).toBeVisible();
    await userEvent.click(canvas.getByText('Note', { exact: true }));
    const note = jotaiStore.get(DRAFT_ATOM).tabs[0].widgets[0];
    await expect(note.title).toBe('Note');
    await expect(jotaiStore.get(EDITING_WIDGET_ATOM)).toBe(note.id);
    await expect(jotaiStore.get(sidePanelPageInfoSelector.atom).page).toBe(
      SidePanelPages.PageLayoutWidgetSettings,
    );
  },
};

export const AddFromSidePanel: Story = {
  args: { surface: 'side-panel' },
  play: AddFromInlinePicker.play,
};

export const ReplaceFirstFromSidePanel: Story = {
  args: { surface: 'side-panel', replacementPosition: 0 },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByText('Note', { exact: true }),
    );
    const widgets = jotaiStore.get(DRAFT_ATOM).tabs[0].widgets;
    await expect(widgets.map(({ title }) => title)).toEqual(
      ['first', 'second', 'tasks'].map((title, index) =>
        index === args.replacementPosition ? 'Note' : title,
      ),
    );
    await expect(widgets.map(({ position }) => position)).toMatchObject(
      [0, 1, 2].map((index) => ({ index })),
    );
    await expect(
      widgets.find(({ id }) => id === jotaiStore.get(EDITING_WIDGET_ATOM))
        ?.title,
    ).toBe('Note');
  },
};

export const ReplaceMiddleFromSidePanel: Story = {
  args: { surface: 'side-panel', replacementPosition: 1 },
  play: ReplaceFirstFromSidePanel.play,
};

export const ReplaceTasksFromSidePanel: Story = {
  args: { surface: 'side-panel', replacementPosition: 2 },
  play: ReplaceFirstFromSidePanel.play,
};

export const MoreWidgets: Story = {
  args: { surface: 'inline-picker' },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByText('More widgets'),
    );
    await expect(jotaiStore.get(DRAFT_ATOM).tabs[0].widgets).toHaveLength(0);
    await expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(true);
    await expect(jotaiStore.get(sidePanelPageInfoSelector.atom).page).toBe(
      SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
    );
  },
};
