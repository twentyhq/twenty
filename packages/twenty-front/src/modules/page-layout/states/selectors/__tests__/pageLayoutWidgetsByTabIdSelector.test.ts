import { createStore } from 'jotai';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { pageLayoutWidgetsByTabIdSelector } from '@/page-layout/states/selectors/pageLayoutWidgetsByTabIdSelector';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('pageLayoutWidgetsByTabIdSelector', () => {
  it('should read a front component widget cached from a metadata event as one', () => {
    const store = createStore();

    store.set(metadataStoreState.atomFamily('pageLayoutWidgets'), {
      current: [
        {
          id: 'front-component-widget',
          pageLayoutTabId: 'app-tab',
          title: 'App widget',
          type: WidgetType.FRONT_COMPONENT,
          isActive: true,
          configuration: {
            configurationType: WidgetConfigurationType.FRONT_COMPONENT,
            frontComponentId: 'front-component-id',
          },
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
        },
      ],
      draft: [],
      status: 'up-to-date',
      currentCollectionHash: 'server-collection-hash',
    });

    const [widget] =
      store.get(pageLayoutWidgetsByTabIdSelector.atom).get('app-tab') ?? [];

    expect(
      isWidgetConfigurationOfType(
        widget?.configuration,
        'FrontComponentConfiguration',
      ),
    ).toBe(true);
    expect(widget?.position?.__typename).toBe(
      'PageLayoutWidgetVerticalListPosition',
    );
  });
});
