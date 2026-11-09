import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { type WidgetDashboardFilterHeaderContent } from '@/page-layout/types/WidgetDashboardFilterHeaderContent';
import { WidgetDashboardFilterHeaderItems } from '@/page-layout/widgets/components/WidgetDashboardFilterHeaderItems';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore } from 'jotai';
import { expect, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const WIDGET_ID = 'widget-dashboard-filter-header-items-story';

const EMPTY_CONTENT: WidgetDashboardFilterHeaderContent = {
  fieldLabels: [],
  pills: [],
  hoverIndicatorText: null,
};

type WidgetDashboardFilterHeaderItemsStoryProps = {
  content: WidgetDashboardFilterHeaderContent;
  isWidgetHovered: boolean;
};

const WidgetDashboardFilterHeaderItemsStory = ({
  content,
  isWidgetHovered,
}: WidgetDashboardFilterHeaderItemsStoryProps) => {
  const store = createStore();

  store.set(
    widgetCardHoveredComponentFamilyState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      familyKey: WIDGET_ID,
    }),
    isWidgetHovered,
  );

  return (
    <PageLayoutTestWrapper store={store}>
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: WIDGET_ID }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          <WidgetDashboardFilterHeaderItems content={content} />
        </div>
      </WidgetComponentInstanceContext.Provider>
    </PageLayoutTestWrapper>
  );
};

const meta: Meta<typeof WidgetDashboardFilterHeaderItemsStory> = {
  title: 'Modules/PageLayout/Widgets/WidgetDashboardFilterHeaderItems',
  component: WidgetDashboardFilterHeaderItemsStory,
  decorators: [ComponentDecorator],
  args: { content: EMPTY_CONTENT, isWidgetHovered: false },
};

export default meta;
type Story = StoryObj<typeof WidgetDashboardFilterHeaderItemsStory>;

const HOVER_TEXT = 'Date range · Close date';

export const FieldIndicatorHiddenUntilHover: Story = {
  args: { content: { ...EMPTY_CONTENT, hoverIndicatorText: HOVER_TEXT } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByLabelText(HOVER_TEXT)).not.toBeVisible();
  },
};

export const FieldIndicatorOnHover: Story = {
  args: {
    content: { ...EMPTY_CONTENT, hoverIndicatorText: HOVER_TEXT },
    isWidgetHovered: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const indicator = await canvas.findByLabelText(HOVER_TEXT);

    expect(indicator).toBeVisible();

    await userEvent.hover(indicator);

    expect(await body.findByText(HOVER_TEXT)).toBeVisible();
  },
};

export const FieldIndicatorOnKeyboardFocus: Story = {
  args: { content: { ...EMPTY_CONTENT, hoverIndicatorText: HOVER_TEXT } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const indicator = await canvas.findByRole('img', { name: HOVER_TEXT });

    await userEvent.tab();

    expect(indicator).toHaveFocus();
    expect(indicator).toBeVisible();
  },
};

const getEditModeFieldLabelStory = (
  fieldLabel: WidgetDashboardFilterHeaderContent['fieldLabels'][number],
): Story => ({
  args: { content: { ...EMPTY_CONTENT, fieldLabels: [fieldLabel] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const label = await canvas.findByText(fieldLabel.text);

    expect(label).toBeVisible();
    expect(
      canvas.getByRole('img', { name: fieldLabel.fullText }),
    ).toBeInTheDocument();

    await userEvent.hover(label);

    expect(await body.findByText(fieldLabel.fullText)).toBeVisible();
  },
});

export const EditModeFieldLabel = getEditModeFieldLabelStory({
  pageLayoutFilterId: 'date-range',
  kind: 'APPLIED',
  text: 'Close date',
  fullText: HOVER_TEXT,
});

export const EditModeIgnoredLabel = getEditModeFieldLabelStory({
  pageLayoutFilterId: 'date-range',
  kind: 'IGNORED',
  text: 'Ignored',
  fullText: 'Date range · Ignored',
});

export const EditModeUnavailableFieldLabel = getEditModeFieldLabelStory({
  pageLayoutFilterId: 'date-range',
  kind: 'UNAVAILABLE',
  text: 'Unavailable field',
  fullText: 'Date range · Unavailable field',
});

export const EditModeNoDateFieldLabel = getEditModeFieldLabelStory({
  pageLayoutFilterId: 'date-range',
  kind: 'NO_DATE_FIELD',
  text: 'No date field',
  fullText: 'Date range · No date field',
});

const getPillStory = (
  pill: WidgetDashboardFilterHeaderContent['pills'][number],
): Story => ({
  args: { content: { ...EMPTY_CONTENT, pills: [pill] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.hover(await canvas.findByText(pill.text));

    expect(await body.findByText(pill.tooltip)).toBeVisible();
  },
});

export const IgnoredPill = getPillStory({
  pageLayoutFilterId: 'date-range',
  kind: 'IGNORED',
  text: 'Ignores Date range',
  tooltip: "The Date range filter doesn't apply to this widget.",
});

export const UnavailableFieldPill = getPillStory({
  pageLayoutFilterId: 'date-range',
  kind: 'UNAVAILABLE',
  text: 'Ignores Date range',
  tooltip:
    "The date field chosen for Date range on this widget is unavailable. Pick another one in the widget's settings.",
});

export const NoDateFieldPill = getPillStory({
  pageLayoutFilterId: 'date-range',
  kind: 'NO_DATE_FIELD',
  text: 'Ignores Date range',
  tooltip: 'This widget has no date field for Date range.',
});

export const OverlapPill = getPillStory({
  pageLayoutFilterId: 'date-range',
  kind: 'OVERLAP',
  text: 'Also filtered on Close date',
  tooltip: "This widget's own filter also uses Close date. Both apply.",
});
