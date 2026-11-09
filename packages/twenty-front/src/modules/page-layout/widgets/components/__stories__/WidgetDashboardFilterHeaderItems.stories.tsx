import { WidgetCardHeaderPillsMaxWidthContext } from '@/page-layout/contexts/WidgetCardHeaderPillsMaxWidthContext';
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
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
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
  maxWidth: number | null;
};

const WidgetDashboardFilterHeaderItemsStory = ({
  content,
  isWidgetHovered,
  maxWidth,
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
        <WidgetCardHeaderPillsMaxWidthContext.Provider value={maxWidth}>
          <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
            <WidgetDashboardFilterHeaderItems content={content} />
          </div>
        </WidgetCardHeaderPillsMaxWidthContext.Provider>
      </WidgetComponentInstanceContext.Provider>
    </PageLayoutTestWrapper>
  );
};

const meta: Meta<typeof WidgetDashboardFilterHeaderItemsStory> = {
  title: 'Modules/PageLayout/Widgets/WidgetDashboardFilterHeaderItems',
  component: WidgetDashboardFilterHeaderItemsStory,
  decorators: [ComponentDecorator],
  args: { content: EMPTY_CONTENT, isWidgetHovered: false, maxWidth: null },
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
    expect(getComputedStyle(indicator).outlineStyle).toBe('solid');
    expect(getComputedStyle(indicator).outlineWidth).toBe('2px');
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
      canvas.queryByRole('img', { name: fieldLabel.fullText }),
    ).not.toBeInTheDocument();

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
  text: 'Date range field unavailable',
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

const PILLS: WidgetDashboardFilterHeaderContent['pills'] = [
  {
    pageLayoutFilterId: 'ignored',
    kind: 'IGNORED',
    text: 'Ignores Date range',
    tooltip: "The Date range filter doesn't apply to this widget.",
  },
  {
    pageLayoutFilterId: 'unavailable',
    kind: 'UNAVAILABLE',
    text: 'Date range field unavailable',
    tooltip:
      "The date field chosen for Date range on this widget is unavailable. Pick another one in the widget's settings.",
  },
  {
    pageLayoutFilterId: 'overlap',
    kind: 'OVERLAP',
    text: 'Also filtered on Close date',
    tooltip: "This widget's own filter also uses Close date. Both apply.",
  },
];

export const PillsShowTheirTextWhenTheyFit: Story = {
  args: { content: { ...EMPTY_CONTENT, pills: PILLS }, maxWidth: 1000 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const { text } of PILLS) {
      const pillText = await canvas.findByText(text);

      expect(pillText.getBoundingClientRect().width).toBeGreaterThan(40);
    }
  },
};

export const PillsCollapseToTheirIconInANarrowHeader: Story = {
  args: { content: { ...EMPTY_CONTENT, pills: PILLS }, maxWidth: 120 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    for (const { text, kind } of PILLS) {
      await waitFor(() =>
        kind === 'UNAVAILABLE'
          ? expect(
              canvas.getByText(text).getBoundingClientRect().width,
            ).toBeGreaterThan(1)
          : expect(
              canvas.getByText(text).getBoundingClientRect().width,
            ).toBeLessThanOrEqual(1),
      );
    }

    const ignoredPill = canvas.getByText('Ignores Date range').parentElement;

    expect(ignoredPill?.querySelector('svg')).toBeVisible();

    if (isDefined(ignoredPill)) {
      await userEvent.hover(ignoredPill);
    }

    expect(await body.findByText(PILLS[0].tooltip)).toBeVisible();
  },
};
