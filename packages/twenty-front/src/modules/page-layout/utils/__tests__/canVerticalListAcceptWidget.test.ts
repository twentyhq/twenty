import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { canVerticalListAcceptWidget } from '@/page-layout/utils/canVerticalListAcceptWidget';
import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from '~/generated-metadata/graphql';

const makeWidgetWithType = (id: string, type: WidgetType, tabId = 'tab-1') => ({
  ...makeWidget(id, 0, tabId),
  type,
});

const makeTabViewportFrontComponent = (id: string, tabId = 'tab-1') => ({
  ...makeWidgetWithType(id, WidgetType.FRONT_COMPONENT, tabId),
  position: {
    __typename: 'PageLayoutWidgetVerticalListPosition' as const,
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: 0,
    heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
  },
});

describe('canVerticalListAcceptWidget', () => {
  it('rejects a viewport-filling widget when the destination already has one', () => {
    expect(
      canVerticalListAcceptWidget({
        destinationWidgets: [
          makeWidgetWithType('emails', WidgetType.EMAILS, 'tab-2'),
        ],
        widget: makeWidgetWithType('notes', WidgetType.NOTES),
      }),
    ).toBe(false);
  });

  it('accepts a viewport-filling widget when the destination only has fit-content widgets', () => {
    expect(
      canVerticalListAcceptWidget({
        destinationWidgets: [
          makeWidgetWithType('fields', WidgetType.FIELDS, 'tab-2'),
        ],
        widget: makeWidgetWithType('notes', WidgetType.NOTES),
      }),
    ).toBe(true);
  });

  it('accepts a fit-content widget when the destination has a viewport-filling widget', () => {
    expect(
      canVerticalListAcceptWidget({
        destinationWidgets: [
          makeWidgetWithType('emails', WidgetType.EMAILS, 'tab-2'),
        ],
        widget: makeWidgetWithType('fields', WidgetType.FIELDS),
      }),
    ).toBe(true);
  });

  it('ignores the dragged widget itself during a same-tab reorder', () => {
    const notesWidget = makeWidgetWithType('notes', WidgetType.NOTES);

    expect(
      canVerticalListAcceptWidget({
        destinationWidgets: [notesWidget],
        widget: notesWidget,
      }),
    ).toBe(true);
  });

  it('ignores inactive viewport-filling widgets in the destination', () => {
    expect(
      canVerticalListAcceptWidget({
        destinationWidgets: [
          {
            ...makeWidgetWithType('emails', WidgetType.EMAILS, 'tab-2'),
            isActive: false,
          },
        ],
        widget: makeWidgetWithType('notes', WidgetType.NOTES),
      }),
    ).toBe(true);
  });

  it('treats an explicit TAB_VIEWPORT front component like a viewport-filling widget', () => {
    expect(
      canVerticalListAcceptWidget({
        destinationWidgets: [
          makeTabViewportFrontComponent('front-component', 'tab-2'),
        ],
        widget: makeWidgetWithType('notes', WidgetType.NOTES),
      }),
    ).toBe(false);

    expect(
      canVerticalListAcceptWidget({
        destinationWidgets: [
          makeWidgetWithType('emails', WidgetType.EMAILS, 'tab-2'),
        ],
        widget: makeTabViewportFrontComponent('front-component'),
      }),
    ).toBe(false);
  });
});
